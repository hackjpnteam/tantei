import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import connectToMongoDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AdminAuthResult {
  success: boolean;
  user?: any;
  error?: string;
  status?: number;
}

export async function verifyAdminAuthSimple(request?: NextRequest): Promise<AdminAuthResult> {
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
    
    // Check admin role in database
    console.log('🔍 [AUTH-SIMPLE] Connecting to MongoDB...');
    await connectToMongoDB();
    
    console.log('🔍 [AUTH-SIMPLE] Looking up user:', userEmail.toLowerCase());
    const currentUser = await User.findOne({ 
      email: userEmail.toLowerCase() 
    });
    
    console.log('🔍 [AUTH-SIMPLE] User lookup result:', {
      found: !!currentUser,
      roles: currentUser?.roles,
      isAdmin: currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('superadmin')
    });

    if (!currentUser) {
      console.log('❌ [AUTH-SIMPLE] User not found in database');
      return {
        success: false,
        error: 'User not found',
        status: 404
      };
    }

    // Check if user has admin or superadmin role
    const hasAdminAccess = currentUser.roles?.includes('admin') || currentUser.roles?.includes('superadmin');
    if (!hasAdminAccess) {
      console.log('❌ [AUTH-SIMPLE] User is not admin:', currentUser.roles);
      return {
        success: false,
        error: 'Admin access required',
        status: 403
      };
    }

    console.log('✅ [AUTH-SIMPLE] Authentication successful for admin:', userEmail);
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