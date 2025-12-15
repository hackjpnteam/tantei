// Simple authentication system to replace NextAuth v5
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface SessionToken {
  userId: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  status?: number;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    // Dynamic import to avoid Edge Runtime issues
    const mongoose = await import('mongoose');
    const { default: UserModel } = await import('../models/User');

    // Connect to MongoDB
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const user = await UserModel.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: (user as any)._id.toString(),
      email: user.email,
      name: user.name,
      role: (user as any).roles?.includes('admin') ? 'admin' : 'user',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function createSessionToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: (user as any).roles?.includes('admin') ? 'admin' : 'user',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 7 days
  });
}

export function verifySessionToken(token: string): SessionToken | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionToken;
    return payload;
  } catch (error) {
    return null;
  }
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set('session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function getSessionCookie(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get('session-token')?.value;
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete('session-token');
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getSessionCookie();
  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

export async function verifyAuthSimple(request?: NextRequest): Promise<AuthResult> {
  try {
    console.log('🔍 [AUTH-SIMPLE] Starting simple authentication...');
    
    // Get all cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    console.log('🔍 [AUTH-SIMPLE] Available cookies:', allCookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      length: c.value?.length || 0 
    })));
    
    let userEmail = null;
    
    // Check for any session cookies and extract email
    for (const cookie of allCookies) {
      if (cookie.name.includes('session-token') && cookie.value) {
        console.log('🔍 [AUTH-SIMPLE] Found session token:', cookie.name);
        try {
          // Try to extract email from JWT payload without verification
          const parts = cookie.value.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            console.log('🔍 [AUTH-SIMPLE] Token payload:', {
              hasEmail: !!payload.email,
              email: payload.email,
              exp: payload.exp,
              currentTime: Date.now() / 1000,
              isExpired: payload.exp < Date.now() / 1000
            });
            
            if (payload.email && payload.exp > Date.now() / 1000) {
              userEmail = payload.email;
              console.log('✅ [AUTH-SIMPLE] Extracted email from token:', userEmail);
              break;
            }
          }
        } catch (parseError) {
          console.log('❌ [AUTH-SIMPLE] Failed to parse token:', parseError);
        }
      }
      
      // Also check simple auth token
      if (cookie.name === 'simple-auth-token' && cookie.value) {
        console.log('🔍 [AUTH-SIMPLE] Found simple auth token');
        try {
          const parts = cookie.value.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            if (payload.email && payload.exp > Date.now() / 1000) {
              userEmail = payload.email;
              console.log('✅ [AUTH-SIMPLE] Extracted email from simple token:', userEmail);
              break;
            }
          }
        } catch (parseError) {
          console.log('❌ [AUTH-SIMPLE] Failed to parse simple token:', parseError);
        }
      }
    }
    
    if (!userEmail) {
      console.log('❌ [AUTH-SIMPLE] No valid email found in any token');
      return {
        success: false,
        error: 'No valid authentication token found',
        status: 401
      };
    }
    
    // Get user from database
    console.log('🔍 [AUTH-SIMPLE] Connecting to MongoDB...');
    await connectToMongoDB();
    
    const { default: UserModel } = await import('../models/User');
    console.log('🔍 [AUTH-SIMPLE] Looking up user:', userEmail.toLowerCase());
    const currentUser = await UserModel.findOne({ 
      email: userEmail.toLowerCase() 
    });
    
    console.log('🔍 [AUTH-SIMPLE] User lookup result:', {
      found: !!currentUser,
      email: currentUser?.email,
      roles: currentUser?.roles
    });
    
    if (!currentUser) {
      console.log('❌ [AUTH-SIMPLE] User not found in database');
      return {
        success: false,
        error: 'User not found',
        status: 404
      };
    }

    console.log('✅ [AUTH-SIMPLE] Authentication successful for user:', userEmail);
    return {
      success: true,
      user: currentUser
    };
  } catch (error) {
    console.error('❌ [AUTH-SIMPLE] Authentication failed:', error);
    return {
      success: false,
      error: 'Authentication verification failed',
      status: 500
    };
  }
}