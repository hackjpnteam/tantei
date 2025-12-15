import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToMongoDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// PUT /api/comments/[id] - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const commentId = params.id;
    const { content } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be 1000 characters or less' },
        { status: 400 }
      );
    }
    
    await connectToMongoDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find comment and verify ownership
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    if (comment.user.toString() !== (user._id as any).toString()) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }
    
    // Update comment
    comment.content = content.trim();
    comment.updatedAt = new Date();
    await comment.save();
    
    // Populate user data for response
    await comment.populate({
      path: 'user',
      select: 'name email profile.avatarUrl'
    });
    
    const formattedComment = {
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user._id.toString(),
        name: comment.user.name,
        email: comment.user.email,
        avatarUrl: comment.user.profile?.avatarUrl
      }
    };
    
    return NextResponse.json({
      success: true,
      comment: formattedComment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const commentId = params.id;
    
    await connectToMongoDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find comment and verify ownership or admin status
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    const isOwner = comment.user.toString() === (user._id as any).toString();
    const isAdmin = user.roles?.includes('admin') || user.roles?.includes('superadmin');
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }
    
    // Delete comment
    await Comment.findByIdAndDelete(commentId);
    
    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}