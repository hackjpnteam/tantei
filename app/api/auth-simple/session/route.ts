import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth-simple';
import connectToMongoDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(null);
    }

    const payload = verifySessionToken(sessionToken);

    if (!payload) {
      return NextResponse.json(null);
    }

    // Fetch latest user data from database to get current roles
    await connectToMongoDB();
    const dbUser = await User.findOne({ email: payload.email.toLowerCase() });

    if (!dbUser) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      user: {
        _id: dbUser._id.toString(),
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name,
        roles: dbUser.roles || ['student'],
        role: dbUser.roles?.includes('superadmin') ? 'superadmin' :
              dbUser.roles?.includes('admin') ? 'admin' : 'user',
        profile: dbUser.profile || {},
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(null);
  }
}