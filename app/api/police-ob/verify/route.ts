import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { userId, badgeId, documentUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // Update user's police OB verification status
    user.policeObVerified = true;
    
    // Add police_ob role if not present
    if (!user.roles.includes('police_ob')) {
      user.roles.push('police_ob');
    }

    await user.save();

    // Create audit log
    await AuditLog.create({
      actorId: userId,
      action: 'police_ob_verification',
      targetType: 'User',
      targetId: userId,
      metadata: {
        badgeId,
        documentUrl,
        verifiedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: '警察OB認証が完了しました',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        policeObVerified: user.policeObVerified
      }
    });

  } catch (error) {
    console.error('Police OB verification error:', error);
    return NextResponse.json(
      { error: '認証処理に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}