import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import Certificate from '@/models/Certificate';
import Course from '@/models/Course';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { userId, trainingCompleted, pledgeAccepted } = body;

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

    // Check if user is verified police OB
    if (!user.policeObVerified) {
      return NextResponse.json(
        { error: '警察OB認証が必要です' },
        { status: 403 }
      );
    }

    // Update onboarding status
    if (!user.obOnboarding) {
      user.obOnboarding = {};
    }
    
    if (trainingCompleted !== undefined) {
      user.obOnboarding.trainingDone = trainingCompleted;
    }
    
    if (pledgeAccepted !== undefined) {
      user.obOnboarding.pledgeAccepted = pledgeAccepted;
    }

    await user.save();

    // Check if both requirements are met for fast-track certification
    if (user.obOnboarding.trainingDone && user.obOnboarding.pledgeAccepted) {
      // Find the basic course to issue a certificate
      const basicCourse = await Course.findOne({ code: 'BASIC-001' });
      
      if (basicCourse) {
        // Issue a fast-track certificate for police OB
        const existingCert = await Certificate.findOne({
          userId: user._id,
          courseId: basicCourse._id
        });

        if (!existingCert) {
          await Certificate.create({
            userId: user._id,
            courseId: basicCourse._id,
            badge: '★3',
            issuedAt: new Date()
          });
        }
      }
    }

    // Create audit log
    await AuditLog.create({
      actorId: userId,
      action: 'police_ob_onboarding',
      targetType: 'User',
      targetId: userId,
      metadata: {
        trainingCompleted,
        pledgeAccepted,
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: '警察OBクイックオンボーディングが更新されました',
      onboardingStatus: {
        trainingDone: user.obOnboarding.trainingDone,
        pledgeAccepted: user.obOnboarding.pledgeAccepted,
        canApplyForCertification: user.obOnboarding.trainingDone && user.obOnboarding.pledgeAccepted
      },
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        policeObVerified: user.policeObVerified
      }
    });

  } catch (error) {
    console.error('Police OB onboarding error:', error);
    return NextResponse.json(
      { error: 'オンボーディング処理に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}