import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import { verifyAdminAuthSimple } from '@/lib/auth-admin-simple';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function DELETE(
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

    // Must be at least admin to delete users
    if (!isAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToMongoDB();

    // Use raw MongoDB to bypass schema validation cache
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

    // Prevent self-deletion
    if (targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Only superadmin can delete other admins/superadmins
    const targetIsAdmin = targetUser.roles?.includes('admin') || targetUser.roles?.includes('superadmin');
    if (targetIsAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only superadmin can delete admin users' },
        { status: 403 }
      );
    }

    await usersCollection.deleteOne({
      _id: new mongoose.Types.ObjectId(params.id)
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
