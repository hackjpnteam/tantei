import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSimple } from '@/lib/auth-simple';
import connectToMongoDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// Check if user has admin or superadmin role
function hasAdminAccess(user: any): boolean {
  return user.roles?.includes('admin') || user.roles?.includes('superadmin');
}

// Check if user is superadmin
function isSuperAdmin(user: any): boolean {
  return user.roles?.includes('superadmin');
}

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthSimple(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasAdminAccess(authResult.user)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToMongoDB();

    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        _id: user._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update user roles (superadmin only for role changes)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuthSimple(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasAdminAccess(authResult.user)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userId, roles, action } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only superadmin can change roles that include admin/superadmin
    const isChangingAdminRoles = roles?.includes('admin') || roles?.includes('superadmin') ||
      targetUser.roles.includes('admin') || targetUser.roles.includes('superadmin');

    if (isChangingAdminRoles && !isSuperAdmin(authResult.user)) {
      return NextResponse.json(
        { error: 'Only superadmin can modify admin privileges' },
        { status: 403 }
      );
    }

    // Prevent removing own superadmin role
    if (targetUser._id.toString() === authResult.user._id.toString() &&
        authResult.user.roles.includes('superadmin') &&
        !roles?.includes('superadmin')) {
      return NextResponse.json(
        { error: 'Cannot remove your own superadmin role' },
        { status: 400 }
      );
    }

    // Handle specific actions
    if (action === 'addRole') {
      const { role } = await request.json();
      if (!targetUser.roles.includes(role)) {
        targetUser.roles.push(role);
      }
    } else if (action === 'removeRole') {
      const { role } = await request.json();
      targetUser.roles = targetUser.roles.filter((r: string) => r !== role);
    } else if (roles) {
      // Replace all roles
      targetUser.roles = roles;
    }

    await targetUser.save();

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        _id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        roles: targetUser.roles
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE user (superadmin only)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuthSimple(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(authResult.user)) {
      return NextResponse.json(
        { error: 'Superadmin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userId === authResult.user._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
