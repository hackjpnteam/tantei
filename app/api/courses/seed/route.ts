import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import Exam from '@/models/Exam';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Define all courses/plans
    const courses = [
      {
        code: 'BASIC',
        title: '基礎コース',
        description: '法律・倫理・聞き込み・尾行・情報収集の基礎を学ぶ入門コース。探偵業法や個人情報保護法などの関連法令、尾行・張込みの基本技術を習得します。',
        priceJPY: 99000,
        durationDays: 60,
        mode: 'online' as const,
        syllabus: [
          '探偵業法・関連法令',
          '倫理・モラル',
          '聞き込み技術',
          '尾行・張込み基礎',
          '情報収集の基礎',
          '報告書作成入門'
        ],
        tags: ['基礎', '初心者向け', '法令', 'オンライン'],
        visible: true
      },
      {
        code: 'PRO',
        title: 'プロコース',
        description: '実地OJT・報告書・案件受託訓練を通じて、即戦力となる探偵を育成する実践コース。提携事務所での現場研修を含みます。',
        priceJPY: 198000,
        durationDays: 90,
        mode: 'hybrid' as const,
        syllabus: [
          '実地OJT（尾行・張込み）',
          '報告書作成実践',
          '案件受託訓練',
          '契約・重要事項説明',
          '撮影技術（夜間・望遠）',
          '実技試験・面接'
        ],
        tags: ['実践', 'プロ', '実地訓練', 'OJT'],
        visible: true
      },
      {
        code: 'ADVANCED',
        title: 'オプション（上級）',
        description: 'ドローン/車両追跡/AI解析ツールなど、最新技術を活用した高度な調査技術を習得する上級コース。随時開講。',
        priceJPY: 33000,
        durationDays: 0,
        mode: 'online' as const,
        syllabus: [
          'ドローン調査技術',
          '車両追跡システム',
          'AI解析ツール活用',
          'ITフォレンジック',
          'GPS活用技術'
        ],
        tags: ['上級', 'ドローン', 'AI', '最新技術'],
        visible: true
      },
      {
        code: 'TANTEI_BASIC',
        title: '探偵業基礎コース',
        description: '探偵業の基礎を集中的に学ぶ1ヶ月の短期集中コース。法律知識から実務基礎まで網羅的に習得します。',
        priceJPY: 300000,
        durationDays: 30,
        mode: 'hybrid' as const,
        syllabus: [
          '探偵業法・関連法令（詳細）',
          '調査倫理・コンプライアンス',
          '聞き込み・情報収集実践',
          '尾行・張込み実務',
          '機材操作基礎',
          '報告書作成実務'
        ],
        tags: ['探偵業', '基礎', '短期集中', '実務'],
        visible: true
      },
      {
        code: 'OPTION_CERTIFIED',
        title: 'オプション認定コース',
        description: '特定分野の専門スキルを認定するオプションコース。各種認定資格の取得を目指します。',
        priceJPY: 150000,
        durationDays: 30,
        mode: 'hybrid' as const,
        syllabus: [
          '専門調査技術',
          '認定試験対策',
          '実技演習',
          '認定試験'
        ],
        tags: ['認定', 'オプション', '専門', '資格'],
        visible: true
      },
      {
        code: 'TANTEI_PRO',
        title: '探偵業プロフェッショナルコース',
        description: '探偵業のプロフェッショナルを育成する最上位コース。高度な調査技術と経営知識を習得し、独立開業を目指します。',
        priceJPY: 500000,
        durationDays: 90,
        mode: 'hybrid' as const,
        syllabus: [
          '高度調査技術（全分野）',
          '探偵事務所経営',
          '顧客対応・営業',
          '危機管理・リスクマネジメント',
          '法務・契約実務',
          '独立開業支援'
        ],
        tags: ['プロフェッショナル', '探偵業', '独立', '経営'],
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
        courseCode: 'BASIC',
        title: '基礎コース修了試験',
        type: 'quiz' as const,
        passingScore: 70,
        items: [
          { question: '探偵業法の目的について説明せよ', type: 'essay' },
          { question: '個人情報保護の基本原則を5つ挙げよ', type: 'essay' },
          { question: '尾行時の注意事項を列挙せよ', type: 'essay' }
        ]
      },
      {
        courseCode: 'PRO',
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
        courseCode: 'ADVANCED',
        title: '上級オプション認定試験',
        type: 'quiz' as const,
        passingScore: 75,
        items: [
          { question: 'ドローン調査の法的制約について', type: 'essay' },
          { question: 'AI解析ツールの活用方法', type: 'essay' },
          { question: '車両追跡の倫理的配慮', type: 'essay' }
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