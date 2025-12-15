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

    // Must be at least admin to change roles
    if (!isAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Admin access required to change roles' },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Only superadmin can grant superadmin role
    if (role === 'superadmin' && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only superadmin can grant superadmin role' },
        { status: 403 }
      );
    }

    await connectToMongoDB();

    // Use raw MongoDB to bypass schema validation cache
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
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

    // Prevent removing own superadmin role
    if (targetUser._id.toString() === currentUser._id.toString() &&
        currentUser.roles?.includes('superadmin') && role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Cannot remove your own superadmin role' },
        { status: 400 }
      );
    }

    // Build new roles array
    let newRoles = targetUser.roles?.filter((r: string) =>
      !['admin', 'superadmin'].includes(r)
    ) || ['student'];

    if (role === 'superadmin') {
      newRoles = Array.from(new Set([...newRoles, 'admin', 'superadmin']));
    } else if (role === 'admin') {
      newRoles = Array.from(new Set([...newRoles, 'admin']));
    }
    // 'user' means no admin roles

    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { $set: { roles: newRoles } }
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
        roles: updatedUser?.roles,
        role: updatedUser?.roles?.includes('superadmin') ? 'superadmin' :
              updatedUser?.roles?.includes('admin') ? 'admin' : 'user'
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}