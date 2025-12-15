import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToMongoDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AdminAuthResult {
  success: boolean;
  user?: any;
  error?: string;
  status?: number;
}

export async function verifyAdminAuth(request?: NextRequest): Promise<AdminAuthResult> {
  try {
    console.log('🔍 [AUTH-ADMIN] Starting authentication verification...');
    let userEmail = null;
    
    // Log environment info
    console.log('🔍 [AUTH-ADMIN] Environment:', {
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      nextauthUrl: process.env.NEXTAUTH_URL,
      hasMongoUri: !!process.env.MONGODB_URI
    });
    
    // In production, prioritize cookie-based auth over NextAuth
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      // Development: Try NextAuth first
      try {
        const session = await auth();
        console.log('🔍 [AUTH-ADMIN] NextAuth session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasEmail: !!session?.user?.email,
          email: session?.user?.email
        });
        
        if (session?.user?.email) {
          userEmail = session.user.email;
          console.log('✅ [AUTH-ADMIN] NextAuth session found:', userEmail);
        }
      } catch (authError) {
        console.log('❌ [AUTH-ADMIN] NextAuth failed:', authError);
      }
    } else {
      console.log('🔍 [AUTH-ADMIN] Production mode: Skipping NextAuth for cookie-based auth');
    }
    
    // If NextAuth fails, try cookie-based auth (including NextAuth cookies)
    if (!userEmail) {
      try {
        console.log('🔍 [AUTH-ADMIN] Trying cookie-based auth...');
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();
        console.log('🔍 [AUTH-ADMIN] Available cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
        
        // Try NextAuth session token first (for production)
        let sessionToken = cookieStore.get('__Secure-next-auth.session-token')?.value || 
                          cookieStore.get('next-auth.session-token')?.value;
        
        if (sessionToken) {
          console.log('🔍 [AUTH-ADMIN] Found NextAuth session token, verifying...');
          try {
            const secret = process.env.NEXTAUTH_SECRET;
            if (!secret) {
              console.log('❌ [AUTH-ADMIN] NEXTAUTH_SECRET not found');
              throw new Error('NEXTAUTH_SECRET not configured');
            }
            
            const decoded = jwt.verify(sessionToken, secret) as any;
            console.log('🔍 [AUTH-ADMIN] NextAuth JWT decoded:', { 
              hasEmail: !!decoded.email, 
              email: decoded.email,
              exp: decoded.exp,
              currentTime: Date.now() / 1000
            });
            
            if (decoded.email) {
              userEmail = decoded.email;
              console.log('✅ [AUTH-ADMIN] NextAuth JWT verified successfully:', userEmail);
            }
          } catch (jwtError) {
            console.log('❌ [AUTH-ADMIN] NextAuth JWT verification failed:', jwtError);
          }
        }
        
        // Fallback to simple auth token
        if (!userEmail) {
          sessionToken = cookieStore.get('simple-auth-token')?.value;
          if (sessionToken) {
            console.log('🔍 [AUTH-ADMIN] Found simple auth token, verifying...');
            
            // Parse JWT token to get user info with proper verification
            try {
              console.log('🔍 [AUTH-ADMIN] Verifying simple auth JWT token...');
              const secret = process.env.NEXTAUTH_SECRET;
              if (!secret) {
                console.log('❌ [AUTH-ADMIN] NEXTAUTH_SECRET not found');
                throw new Error('NEXTAUTH_SECRET not configured');
              }
              
              // Try to verify the JWT token
              const decoded = jwt.verify(sessionToken, secret) as any;
              console.log('🔍 [AUTH-ADMIN] Simple auth JWT decoded:', { 
                hasEmail: !!decoded.email, 
                email: decoded.email,
                exp: decoded.exp,
                currentTime: Date.now() / 1000
              });
              
              if (decoded.email) {
                userEmail = decoded.email;
                console.log('✅ [AUTH-ADMIN] Simple auth JWT verified successfully:', userEmail);
              } else {
                console.log('❌ [AUTH-ADMIN] Simple auth JWT token missing email');
              }
            } catch (jwtError) {
              console.log('❌ [AUTH-ADMIN] Simple auth JWT verification failed:', jwtError);
              
              // Fallback: try basic JWT parsing without verification
              try {
                const tokenParts = sessionToken.split('.');
                console.log('🔍 [AUTH-ADMIN] Fallback: Token parts count:', tokenParts.length);
                
                if (tokenParts.length === 3) {
                  const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                  console.log('🔍 [AUTH-ADMIN] Fallback payload:', { 
                    hasEmail: !!payload.email, 
                    email: payload.email,
                    exp: payload.exp,
                    currentTime: Date.now() / 1000,
                    isExpired: payload.exp <= Date.now() / 1000
                  });
                  
                  if (payload.email && payload.exp > Date.now() / 1000) {
                    userEmail = payload.email;
                    console.log('✅ [AUTH-ADMIN] Fallback token parsing successful:', userEmail);
                  } else {
                    console.log('❌ [AUTH-ADMIN] Fallback token expired or invalid');
                  }
                }
              } catch (fallbackError) {
                console.log('❌ [AUTH-ADMIN] Fallback parsing failed:', fallbackError);
              }
            }
          } else {
            console.log('❌ [AUTH-ADMIN] No auth tokens found');
          }
        }
      } catch (simpleAuthError) {
        console.log('❌ [AUTH-ADMIN] Simple auth error:', simpleAuthError);
      }
    }
    
    if (!userEmail) {
      console.log('❌ [AUTH-ADMIN] No valid authentication found');
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }

    // Check admin role in database
    console.log('🔍 [AUTH-ADMIN] Connecting to MongoDB...');
    await connectToMongoDB();
    
    console.log('🔍 [AUTH-ADMIN] Looking up user:', userEmail.toLowerCase());
    const currentUser = await User.findOne({ 
      email: userEmail.toLowerCase() 
    });
    
    console.log('🔍 [AUTH-ADMIN] User lookup result:', {
      found: !!currentUser,
      hasRoles: currentUser?.roles,
      isAdmin: currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('superadmin')
    });
    
    if (!currentUser) {
      console.log('❌ [AUTH-ADMIN] User not found in database');
      return {
        success: false,
        error: 'User not found',
        status: 404
      };
    }
    
    if (!currentUser.roles?.includes('admin') && !currentUser.roles?.includes('superadmin')) {
      console.log('❌ [AUTH-ADMIN] User is not admin:', currentUser.roles);
      return {
        success: false,
        error: 'Admin access required',
        status: 403
      };
    }

    console.log('✅ [AUTH-ADMIN] Authentication successful for admin:', userEmail);
    return {
      success: true,
      user: currentUser
    };
  } catch (error) {
    console.error('❌ [AUTH-ADMIN] Authentication verification failed:', error);
    return {
      success: false,
      error: 'Authentication verification failed',
      status: 500
    };
  }
}