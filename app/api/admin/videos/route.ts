import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import { verifyAdminAuthSimple } from '@/lib/auth-admin-simple';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

// Simple video storage in MongoDB (you can create a Video model later)
export async function POST(request: NextRequest) {
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

    const videoData = await request.json();
    console.log('Video data received:', JSON.stringify(videoData, null, 2));
    console.log('Instructor data structure:', JSON.stringify(videoData.instructor, null, 2));
    
    // Validate instructor data
    if (!videoData.instructor || !videoData.instructor._id || !videoData.instructor.name) {
      console.error('Invalid instructor data:', videoData.instructor);
      return NextResponse.json(
        { error: 'ゲスト情報が不正です。ゲストを選択してください。' },
        { status: 400 }
      );
    }
    
    console.log('Creating video with instructor:', {
      _id: videoData.instructor._id,
      name: videoData.instructor.name,
      avatarUrl: videoData.instructor.avatarUrl
    });
    
    // Create new video in MongoDB
    const videoToSave = {
      title: videoData.title,
      description: videoData.description,
      category: videoData.category || 'その他',
      course: videoData.course || null,
      durationSec: 0, // Default value
      difficulty: 'beginner', // Default value
      thumbnailUrl: videoData.thumbnailUrl || '/default-thumbnail.png',
      videoUrl: videoData.sourceUrl,
      sourceUrl: videoData.sourceUrl,
      instructor: {
        _id: videoData.instructor._id,
        name: videoData.instructor.name,
        title: videoData.instructor.title || '',
        bio: videoData.instructor.bio || '',
        avatarUrl: videoData.instructor.avatarUrl || '/guest-instructor-avatar.png',
        tags: videoData.instructor.tags || []
      },
      stats: {
        likes: 0
      },
      createdBy: currentUser._id.toString()
    };
    
    console.log('Video to save:', JSON.stringify(videoToSave, null, 2));
    
    const video = new Video(videoToSave);
    
    const savedVideo = await video.save() as any;
    console.log('✅ Video saved to MongoDB:', savedVideo._id);
    
    return NextResponse.json({
      message: '動画を追加しました',
      video: {
        id: savedVideo._id.toString(),
        _id: savedVideo._id.toString(),
        title: savedVideo.title,
        description: savedVideo.description,
        category: savedVideo.category,
        sourceUrl: savedVideo.sourceUrl,
        thumbnailUrl: savedVideo.thumbnailUrl,
        instructor: savedVideo.instructor,
        stats: savedVideo.stats,
        createdAt: savedVideo.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}