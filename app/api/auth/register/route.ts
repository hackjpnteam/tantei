import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToMongoDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const { name, email, password } = await request.json();

    // バリデーション
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '名前、メールアドレス、パスワードは必須です' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }

    // 既存ユーザーのチェック
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }

    // パスワードのハッシュ化
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ユーザー作成
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'user'
    });

    await user.save();

    return NextResponse.json(
      {
        message: 'アカウントが作成されました',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'アカウントの作成に失敗しました' },
      { status: 500 }
    );
  }
}