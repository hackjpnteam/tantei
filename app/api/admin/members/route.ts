import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import { verifyAdminAuthSimple } from '@/lib/auth-admin-simple';
import User from '@/models/User';
import Video from '@/models/Video';
import CompletedVideo from '@/models/CompletedVideo';
import Course from '@/models/Course';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await verifyAdminAuthSimple(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status || 500 }
      );
    }

    await connectToMongoDB();

    // Get all users from MongoDB
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
    console.log('Loaded users from MongoDB:', users.length);

    // Get total video count
    const totalVideos = await Video.countDocuments({ isPublished: true });

    // Get completed videos for all users
    const completedVideosAgg = await CompletedVideo.aggregate([
      {
        $group: {
          _id: '$user',
          completedCount: { $sum: 1 }
        }
      }
    ]);

    // Create a map of user ID to completed count
    const completedMap = new Map();
    completedVideosAgg.forEach((item: any) => {
      completedMap.set(item._id.toString(), item.completedCount);
    });

    // Get all courses for plan lookup
    const courses = await Course.find({ visible: true });
    const courseMap = new Map();
    courses.forEach((course: any) => {
      courseMap.set(course.code, {
        code: course.code,
        title: course.title,
        priceJPY: course.priceJPY,
        durationDays: course.durationDays
      });
    });

    return NextResponse.json({
      members: users.map((user: any) => {
        // Determine the role from roles array
        let role = 'user';
        if (user.roles?.includes('superadmin')) {
          role = 'superadmin';
        } else if (user.roles?.includes('admin')) {
          role = 'admin';
        }

        const completedVideos = completedMap.get(user._id.toString()) || 0;
        const completionRate = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

        // Get plan info
        const planInfo = user.subscribedPlan ? courseMap.get(user.subscribedPlan) : null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role,
          roles: user.roles || ['student'],
          subscribedPlan: user.subscribedPlan || null,
          planTitle: planInfo?.title || null,
          planStartDate: user.planStartDate || null,
          planEndDate: user.planEndDate || null,
          createdAt: user.createdAt,
          lastAccess: user.lastAccess || user.createdAt,
          profile: user.profile || {},
          completedVideos,
          totalVideos,
          completionRate
        };
      }),
      total: users.length,
      courses: courses.map((c: any) => ({
        code: c.code,
        title: c.title,
        priceJPY: c.priceJPY,
        durationDays: c.durationDays
      }))
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}