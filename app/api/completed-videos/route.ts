import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSimple } from '@/lib/auth-simple';
import connectToMongoDB from '@/lib/mongodb';
import CompletedVideo from '@/models/CompletedVideo';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🎬 API: Getting completed videos...');
    const authResult = await verifyAuthSimple(request);

    if (!authResult.success || !authResult.user) {
      console.log('🎬 API: No session or email');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    console.log('🎬 API: User email:', user.email);

    await connectToMongoDB();

    const completedVideos = await CompletedVideo.find({ user: user._id })
      .populate({
        path: 'video',
        select: 'title description thumbnailUrl instructor createdAt stats'
      })
      .sort({ completedAt: -1 })
      .lean();

    console.log('🎬 API: Found completed videos count:', completedVideos.length);

    // Filter out entries where video is null (deleted videos)
    const validCompletedVideos = completedVideos.filter(cv => cv.video != null);

    const formattedVideos = validCompletedVideos.map(cv => {
      const video = cv.video as any;
      return {
        _id: video._id.toString(),
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        instructor: video.instructor, // Already embedded object
        completedAt: cv.completedAt
      };
    });

    console.log('🎬 API: Formatted videos:', formattedVideos.length);

    return NextResponse.json({
      success: true,
      videos: formattedVideos
    });
  } catch (error) {
    console.error('🎬 API: Error fetching completed videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 API POST: Marking video as completed...');
    const authResult = await verifyAuthSimple(request);

    if (!authResult.success || !authResult.user) {
      console.log('🎬 API POST: No session or email');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    console.log('🎬 API POST: User email:', user.email);

    const { videoId } = await request.json();
    console.log('🎬 API POST: Video ID:', videoId);

    if (!videoId) {
      console.log('🎬 API POST: No video ID provided');
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const video = await Video.findById(videoId);
    console.log('🎬 API POST: Video found:', video ? { id: video._id, title: video.title } : 'Not found');
    
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const existingCompletedVideo = await CompletedVideo.findOne({ 
      user: user._id, 
      video: videoId 
    });
    
    console.log('🎬 API POST: Existing completed video:', existingCompletedVideo ? 'Found' : 'Not found');
    
    if (existingCompletedVideo) {
      console.log('🎬 API POST: Video already completed, returning existing');
      return NextResponse.json(
        { message: 'Video already marked as completed' },
        { status: 200 }
      );
    }

    const completedVideo = await CompletedVideo.create({
      user: user._id,
      video: videoId,
      completedAt: new Date()
    });

    console.log('🎬 API POST: Created completed video:', completedVideo._id);

    return NextResponse.json({
      message: 'Video marked as completed',
      completedVideo: {
        id: (completedVideo._id as any).toString(),
        videoId: videoId,
        completedAt: completedVideo.completedAt
      }
    });
  } catch (error) {
    console.error('🎬 API POST: Error marking video as completed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuthSimple(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const result = await CompletedVideo.deleteOne({
      user: user._id,
      video: videoId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Completed video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Video removed from completed list'
    });
  } catch (error) {
    console.error('Error removing completed video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}