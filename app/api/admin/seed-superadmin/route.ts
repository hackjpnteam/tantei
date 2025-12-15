import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// This endpoint grants superadmin to the specified email
// Should only be used for initial setup
export async function POST(request: NextRequest) {
  try {
    const SUPERADMIN_EMAIL = 'tomura@hackjpn.com';

    await connectToMongoDB();

    // Use raw MongoDB operation to bypass Mongoose schema validation cache
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: SUPERADMIN_EMAIL });

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${SUPERADMIN_EMAIL} not found` },
        { status: 404 }
      );
    }

    // Add superadmin and admin roles if not present
    const currentRoles = user.roles || [];
    const newRoles = Array.from(new Set([...currentRoles, 'superadmin', 'admin']));

    await usersCollection.updateOne(
      { email: SUPERADMIN_EMAIL },
      { $set: { roles: newRoles } }
    );

    const updatedUser = await usersCollection.findOne({ email: SUPERADMIN_EMAIL });

    return NextResponse.json({
      success: true,
      message: `Superadmin privileges granted to ${SUPERADMIN_EMAIL}`,
      user: {
        _id: updatedUser?._id.toString(),
        name: updatedUser?.name,
        email: updatedUser?.email,
        roles: updatedUser?.roles
      }
    });
  } catch (error) {
    console.error('Error granting superadmin:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
