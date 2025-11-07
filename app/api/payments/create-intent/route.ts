import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { createPaymentIntent } from '@/lib/stripe';
import User from '@/models/User';
import Course from '@/models/Course';
import Payment from '@/models/Payment';
import AuditLog from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'ユーザーIDとコースIDが必要です' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe決済システムが設定されていません' },
        { status: 501 }
      );
    }

    // Find the user and course
    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId)
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    if (!course) {
      return NextResponse.json(
        { error: 'コースが見つかりません' },
        { status: 404 }
      );
    }

    // Check if user is police OB with fast-track eligibility
    let adjustedPrice = course.priceJPY;
    if (user.policeObVerified && user.obOnboarding?.trainingDone && user.obOnboarding?.pledgeAccepted) {
      // Apply special discount for verified police OB who completed onboarding
      adjustedPrice = Math.floor(course.priceJPY * 0.5); // 50% discount for police OB
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(adjustedPrice, {
      userId: userId.toString(),
      courseId: courseId.toString(),
      courseCode: course.code,
      userEmail: user.email,
      isPoliceOB: user.policeObVerified ? 'true' : 'false'
    });

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent creation failed' },
        { status: 500 }
      );
    }

    // Create payment record in database
    const payment = await Payment.create({
      userId,
      courseId,
      stripePaymentIntentId: paymentIntent.id,
      amountJPY: adjustedPrice,
      status: 'pending'
    });

    // Create audit log
    await AuditLog.create({
      actorId: userId,
      action: 'payment_intent_created',
      targetType: 'Payment',
      targetId: payment._id,
      metadata: {
        courseCode: course.code,
        amountJPY: adjustedPrice,
        originalPrice: course.priceJPY,
        discountApplied: course.priceJPY !== adjustedPrice
      }
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: adjustedPrice,
      course: {
        title: course.title,
        code: course.code,
        priceJPY: course.priceJPY,
        discountedPrice: adjustedPrice
      }
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: '支払い処理の初期化に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}