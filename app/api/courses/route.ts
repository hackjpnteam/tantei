import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import Course from '@/models/Course';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const courses = await Course.find({ visible: true })
      .sort({ code: 1 })
      .lean();

    return NextResponse.json({
      courses: courses.map(course => ({
        ...course,
        _id: course._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
