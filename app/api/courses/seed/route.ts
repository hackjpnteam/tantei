import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import Exam from '@/models/Exam';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Define the three courses
    const courses = [
      {
        code: 'BASIC-001',
        title: '探偵業基礎コース',
        description: '探偵業の基礎知識から実務まで、45日間で包括的に学ぶ入門コース。探偵業法や個人情報保護法などの関連法令、尾行・張込みの基本技術、報告書作成スキルを習得します。',
        priceJPY: 300000,
        durationDays: 45,
        mode: 'online' as const,
        syllabus: [
          '探偵業入門',
          '関連法令（探偵業法/個人情報保護法ほか）',
          '尾行/張込み基礎',
          '報告書作成',
          '倫理/モラル',
          'ミニ実技映像',
          '筆記試験/レポート'
        ],
        tags: ['基礎', '初心者向け', '法令', 'オンライン'],
        visible: true
      },
      {
        code: 'PRO-001',
        title: '探偵業プロフェッショナルコース',
        description: '90日間の実践的な探偵業務トレーニング。都市と地方での尾行実地訓練、高度な撮影技術、IT調査の基礎、提携事務所でのOJTを通じて、即戦力となる探偵を育成します。',
        priceJPY: 500000,
        durationDays: 90,
        mode: 'hybrid' as const,
        syllabus: [
          '尾行実地(都市/地方)',
          '張込み実地',
          '撮影技術(夜間/望遠)',
          'GPS/IT調査の基礎',
          '契約/重要事項説明演習',
          'OJT(提携事務所)',
          '実技試験/面接'
        ],
        tags: ['実践', '上級', '実地訓練', 'OJT'],
        visible: true
      },
      {
        code: 'OPT-001',
        title: 'オプション認定コース',
        description: '30日間の専門分野習得コース。海外調査、ITフォレンジック、高齢者見守りなど、現代の探偵業務に必要な特殊技能を学び、DOCOTAN認定探偵としての専門性を高めます。',
        priceJPY: 150000,
        durationDays: 30,
        mode: 'online' as const,
        syllabus: [
          '海外調査入門',
          'ITフォレンジック基礎',
          '高齢者見守り/所在確認',
          '事例研究',
          '認定試験'
        ],
        tags: ['専門', '認定', '海外', 'IT'],
        visible: true
      }
    ];

    // Upsert courses (idempotent operation)
    const createdCourses = [];
    for (const courseData of courses) {
      const course = await Course.findOneAndUpdate(
        { code: courseData.code },
        courseData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdCourses.push(course);
    }

    // Create sample lessons for each course
    for (const course of createdCourses) {
      const syllabusItems = course.syllabus;
      
      for (let i = 0; i < syllabusItems.length; i++) {
        await Lesson.findOneAndUpdate(
          { courseId: course._id, order: i + 1 },
          {
            courseId: course._id,
            title: syllabusItems[i],
            videoUrl: `https://vimeo.com/sample${i + 1}`, // プレースホルダー
            materials: [
              {
                type: 'pdf',
                url: `/materials/${course.code.toLowerCase()}/lesson${i + 1}.pdf`,
                label: `${syllabusItems[i]}教材`
              }
            ],
            order: i + 1
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    // Create exams for each course
    const exams = [
      {
        courseCode: 'BASIC-001',
        title: '基礎コース筆記試験',
        type: 'quiz' as const,
        passingScore: 70,
        items: [
          { question: '探偵業法の目的について説明せよ', type: 'essay' },
          { question: '個人情報保護の基本原則を5つ挙げよ', type: 'essay' },
          { question: '尾行時の注意事項を列挙せよ', type: 'essay' }
        ]
      },
      {
        courseCode: 'PRO-001',
        title: 'プロコース実技試験',
        type: 'practical' as const,
        passingScore: 80,
        items: [
          { task: '都市部での尾行実技', evaluation: 'instructor' },
          { task: '夜間撮影実技', evaluation: 'instructor' },
          { task: '報告書作成実技', evaluation: 'instructor' }
        ]
      },
      {
        courseCode: 'OPT-001',
        title: 'オプション認定試験',
        type: 'quiz' as const,
        passingScore: 75,
        items: [
          { question: '海外調査の法的制約について', type: 'essay' },
          { question: 'デジタルフォレンジックの基本手順', type: 'essay' },
          { question: '高齢者見守りサービスの倫理的配慮', type: 'essay' }
        ]
      }
    ];

    for (const examData of exams) {
      const course = createdCourses.find(c => c.code === examData.courseCode);
      if (course) {
        await Exam.findOneAndUpdate(
          { courseId: course._id, title: examData.title },
          {
            courseId: course._id,
            title: examData.title,
            type: examData.type,
            passingScore: examData.passingScore,
            items: examData.items
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'DOCOTAN探偵学校のコースデータを正常に作成しました',
      coursesCreated: createdCourses.length,
      courses: createdCourses.map(c => ({
        code: c.code,
        title: c.title,
        priceJPY: c.priceJPY,
        durationDays: c.durationDays,
        mode: c.mode
      }))
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'シードデータの作成に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}