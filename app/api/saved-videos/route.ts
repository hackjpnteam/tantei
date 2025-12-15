import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSimple } from '@/lib/auth-simple';
import connectToMongoDB from '@/lib/mongodb';
import SavedVideo from '@/models/SavedVideo';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthSimple(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    await connectToMongoDB();

    const savedVideos = await SavedVideo.find({ user: user._id })
      .populate({
        path: 'video',
        select: 'title description thumbnailUrl instructor createdAt stats'
      })
      .sort({ savedAt: -1 })
      .lean();

    // Filter out entries where video is null (deleted videos)
    const validSavedVideos = savedVideos.filter(sv => sv.video != null);

    const formattedVideos = validSavedVideos.map(sv => {
      const video = sv.video as any;
      return {
        _id: video._id.toString(),
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        instructor: video.instructor, // Already embedded object
        savedAt: sv.savedAt
      };
    });

    return NextResponse.json({
      savedVideos: formattedVideos
    });
  } catch (error) {
    console.error('Error fetching saved videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthSimple(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const existingSavedVideo = await SavedVideo.findOne({ 
      user: user._id, 
      video: videoId 
    });
    
    if (existingSavedVideo) {
      return NextResponse.json(
        { error: 'Video already saved' },
        { status: 409 }
      );
    }

    await SavedVideo.create({
      user: user._id,
      video: videoId,
      savedAt: new Date()
    });

    // Fetch updated list of saved videos
    const updatedSavedVideos = await SavedVideo.find({ user: user._id })
      .populate({
        path: 'video',
        select: 'title description thumbnailUrl instructor createdAt stats'
      })
      .sort({ savedAt: -1 })
      .lean();

    const validSavedVideos = updatedSavedVideos.filter(sv => sv.video != null);
    const formattedVideos = validSavedVideos.map(sv => {
      const video = sv.video as any;
      return {
        _id: video._id.toString(),
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        instructor: video.instructor,
        savedAt: sv.savedAt
      };
    });

    return NextResponse.json({
      message: 'Video saved successfully',
      savedVideos: formattedVideos
    });
  } catch (error) {
    console.error('Error saving video:', error);
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

    const result = await SavedVideo.deleteOne({
      user: user._id,
      video: videoId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Saved video not found' },
        { status: 404 }
      );
    }

    // Fetch updated list of saved videos
    const updatedSavedVideos = await SavedVideo.find({ user: user._id })
      .populate({
        path: 'video',
        select: 'title description thumbnailUrl instructor createdAt stats'
      })
      .sort({ savedAt: -1 })
      .lean();

    const validSavedVideos = updatedSavedVideos.filter(sv => sv.video != null);
    const formattedVideos = validSavedVideos.map(sv => {
      const video = sv.video as any;
      return {
        _id: video._id.toString(),
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        instructor: video.instructor,
        savedAt: sv.savedAt
      };
    });

    return NextResponse.json({
      message: 'Video removed from saved list',
      savedVideos: formattedVideos
    });
  } catch (error) {
    console.error('Error removing saved video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}