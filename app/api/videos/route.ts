import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const course = searchParams.get('course');
    const instructor = searchParams.get('instructor');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (course) {
      query.course = course;
    }

    if (instructor) {
      query['instructor.name'] = instructor;
    }

    try {
      // Try to get from MongoDB first
      const total = await Video.countDocuments(query);
      const videos = await Video.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Get unique categories
      const allVideos = await Video.find({}).select('category').lean();
      const categories = Array.from(new Set(allVideos.map((v: any) => v.category).filter(Boolean)));

      console.log(`✅ Found ${videos.length} videos in MongoDB`);
      
      return NextResponse.json({
        videos,
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      console.log('💡 Falling back to mock data due to database error:', dbError);
      
      // Fallback to mock data
      const { mockVideos } = await import('@/lib/mockData');
      
      // Filter mock data based on search parameters
      let filteredVideos = mockVideos;
      
      if (search) {
        filteredVideos = mockVideos.filter(video =>
          video.title.toLowerCase().includes(search.toLowerCase()) ||
          video.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (category) {
        filteredVideos = filteredVideos.filter(video => video.category === category);
      }
      
      if (instructor) {
        filteredVideos = filteredVideos.filter(video => video.instructor.name === instructor);
      }
      
      // Apply pagination
      const total = filteredVideos.length;
      const startIndex = (page - 1) * limit;
      const paginatedVideos = filteredVideos.slice(startIndex, startIndex + limit);
      
      // Get unique categories
      const categories = Array.from(new Set(mockVideos.map(v => v.category).filter(Boolean)));

      return NextResponse.json({
        videos: paginatedVideos,
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}