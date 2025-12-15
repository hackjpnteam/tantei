import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import { verifyAdminAuthSimple } from '@/lib/auth-admin-simple';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const authResult = await verifyAdminAuthSimple(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status || 500 }
      );
    }

    const currentUser = authResult.user;
    const isSuperAdmin = currentUser.roles?.includes('superadmin');
    const isAdmin = currentUser.roles?.includes('admin');

    // Must be at least admin to change status
    if (!isAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const targetUser = await usersCollection.findOne({
      _id: new mongoose.Types.ObjectId(params.id)
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing own status
    if (targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot change your own status' },
        { status: 400 }
      );
    }

    // Only superadmin can change admin/superadmin status
    const targetIsAdmin = targetUser.roles?.includes('admin') || targetUser.roles?.includes('superadmin');
    if (targetIsAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only superadmin can change admin user status' },
        { status: 403 }
      );
    }

    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { $set: { status: status } }
    );

    const updatedUser = await usersCollection.findOne({
      _id: new mongoose.Types.ObjectId(params.id)
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser?._id.toString(),
        name: updatedUser?.name,
        email: updatedUser?.email,
        status: updatedUser?.status || 'active'
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
