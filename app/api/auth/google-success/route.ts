import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/auth-simple';
import connectToMongoDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  console.log('🔥 Google OAuth success handler triggered');
  
  try {
    // Check if we have a pending Google session from JWT callback
    const pendingSession = (global as any).pendingGoogleSession;
    
    if (pendingSession) {
      console.log('✅ Found pending Google session from JWT callback');
      
      // Clear the pending session
      delete (global as any).pendingGoogleSession;
      
      // Redirect to mypage with session cookie set
      const response = NextResponse.redirect(new URL('/mypage', request.url));
      
      // Set the auth-simple session cookie
      response.cookies.set('session-token', pendingSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      console.log('✅ Session cookie set from pending session, redirecting to /mypage');
      return response;
    }
    
    // Fallback: Get user email from NextAuth session API
    console.log('🔥 No pending session, fetching NextAuth session to get actual user email');
    const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    });
    
    const sessionData = await sessionResponse.json();
    console.log('🔥 NextAuth session data:', JSON.stringify(sessionData, null, 2));
    
    const email = sessionData?.user?.email;
    const name = sessionData?.user?.name;
    
    console.log('🔥 Processing Google OAuth success for:', email);
    
    if (!email) {
      console.error('❌ No email found in NextAuth session');
      return NextResponse.redirect(new URL('/auth/error?error=Configuration', request.url));
    }
    
    // Connect to MongoDB
    await connectToMongoDB();
    const { default: User } = await import('@/models/User');
    
    // Find user in MongoDB
    console.log('🔍 Looking up user in MongoDB:', email);
    const mongoUser = await User.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!mongoUser) {
      console.error('❌ User not found in MongoDB during OAuth success');
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url));
    }
    
    console.log('✅ User found in MongoDB:', mongoUser.email, 'Roles:', mongoUser.roles);

    // Create auth-simple session token
    const sessionToken = createSessionToken({
      id: (mongoUser as any)._id.toString(),
      email: mongoUser.email,
      name: mongoUser.name,
      role: mongoUser.roles?.includes('superadmin') ? 'superadmin' :
            mongoUser.roles?.includes('admin') ? 'admin' : 'user'
    });
    
    console.log('✅ Auth-simple session token created:', sessionToken.substring(0, 20) + '...');
    
    // Redirect to mypage with session cookie set
    const response = NextResponse.redirect(new URL('/mypage', request.url));
    
    // Set the auth-simple session cookie
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    console.log('✅ Session cookie set, redirecting to /mypage');
    return response;
    
  } catch (error) {
    console.error('💥 Error in Google OAuth success handler:', error);
    return NextResponse.redirect(new URL('/auth/error?error=Configuration', request.url));
  }
}