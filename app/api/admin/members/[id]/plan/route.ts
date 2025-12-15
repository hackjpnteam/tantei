import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import { verifyAdminAuthSimple } from '@/lib/auth-admin-simple';
import mongoose from 'mongoose';
import Course from '@/models/Course';

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

    // Must be at least admin to change plan
    if (!isAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { planCode } = await request.json();

    await connectToMongoDB();

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

    // Validate plan code if provided
    let planStartDate = null;
    let planEndDate = null;

    if (planCode && planCode !== 'none') {
      const course = await Course.findOne({ code: planCode });
      if (!course) {
        return NextResponse.json(
          { error: 'Invalid plan code' },
          { status: 400 }
        );
      }

      // Set plan dates
      planStartDate = new Date();
      if (course.durationDays > 0) {
        planEndDate = new Date();
        planEndDate.setDate(planEndDate.getDate() + course.durationDays);
      }
    }

    // Update user's plan
    const updateData: any = {
      subscribedPlan: planCode === 'none' ? null : planCode,
      planStartDate: planCode === 'none' ? null : planStartDate,
      planEndDate: planCode === 'none' ? null : planEndDate
    };

    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { $set: updateData }
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
        subscribedPlan: updatedUser?.subscribedPlan,
        planStartDate: updatedUser?.planStartDate,
        planEndDate: updatedUser?.planEndDate
      }
    });
  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
