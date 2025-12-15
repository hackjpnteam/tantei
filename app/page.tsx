import Link from 'next/link';
import connectToMongoDB from '@/lib/mongodb';
import Video from '@/models/Video';
import Instructor from '@/models/Instructor';

async function getLatestVideos() {
  try {
    await connectToMongoDB();
    const videos = await Video.find({ isPublished: true })
      .populate('instructor', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    return JSON.parse(JSON.stringify(videos));
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

async function getFeaturedInstructors() {
  try {
    await connectToMongoDB();
    const instructors = await Instructor.find({ isActive: true })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(instructors));
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }
}

export default async function Home() {
  const [latestVideos, instructors] = await Promise.all([
    getLatestVideos(),
    getFeaturedInstructors()
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="mb-8 flex justify-center items-center">
            <img
              src="/docotan-logo.png"
              alt="DOCOTAN探偵学校"
              className="h-32 w-auto object-contain"
            />
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              探偵の知識とスキルを、すべての人に。
            </h1>
            <p className="text-xl text-blue-700 font-medium">
              現役プロと学ぶ、民間探偵の実践型ハイブリッド教育。基礎からOJT、認定まで。
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-sm mb-10">
            <span className="px-4 py-2 bg-white/70 backdrop-blur rounded-full text-gray-700 border border-white/50">オンライン×OJT</span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur rounded-full text-gray-700 border border-white/50">現役講師陣</span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur rounded-full text-gray-700 border border-white/50">認定バッジ</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/videos"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              コースを見る
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border border-blue-200"
            >
              無料で始める
            </Link>
          </div>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Link
            href="/instructors"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-center transform group-hover:scale-105 group-hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                👨‍🏫
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-800 transition-colors">
                講師陣
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                現役探偵・警察OB・法務専門家が実践的指導を提供
              </p>
            </div>
          </Link>

          <Link
            href="/videos"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-center transform group-hover:scale-105 group-hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                🎥
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-800 transition-colors">
                コース
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                基礎からプロまで、段階的に探偵スキルを習得
              </p>
            </div>
          </Link>

          <Link
            href="/certification"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-center transform group-hover:scale-105 group-hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                🏆
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-800 transition-colors">
                認定制度
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                DCD-Basic/DCD-Pro認定バッジを取得
              </p>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">DOCOTAN探偵学校の特徴</h2>
            <p className="text-gray-600">プロの探偵になるための最適な学習環境を提供します</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                📱
              </div>
              <h3 className="font-bold text-gray-900 mb-2">いつでもどこでも</h3>
              <p className="text-sm text-gray-600">スマホ・PC・タブレットで24時間いつでも学習可能</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                🎯
              </div>
              <h3 className="font-bold text-gray-900 mb-2">実践重視</h3>
              <p className="text-sm text-gray-600">現場で使える実践的なスキルを重点的に学習</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                👥
              </div>
              <h3 className="font-bold text-gray-900 mb-2">プロから学ぶ</h3>
              <p className="text-sm text-gray-600">経験豊富な現役探偵・警察OBが直接指導</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                📜
              </div>
              <h3 className="font-bold text-gray-900 mb-2">認定資格</h3>
              <p className="text-sm text-gray-600">修了後はDOCOTAN認定資格を取得可能</p>
            </div>
          </div>
        </div>

        {/* Latest Videos Section */}
        {latestVideos.length > 0 && (
          <div className="mb-20">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">最新の動画</h2>
                <p className="text-gray-600">新しく追加されたコンテンツをチェック</p>
              </div>
              <Link
                href="/videos"
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                すべて見る →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestVideos.map((video: any) => (
                <Link
                  key={video._id}
                  href={`/videos/${video._id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {video.title}
                    </h3>
                    {video.instructor && (
                      <p className="text-sm text-gray-600">{video.instructor.name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Learning Flow Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">受講の流れ</h2>
            <p className="text-gray-600">4つのステップでプロの探偵へ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-bold text-gray-900 mb-2">無料登録</h3>
                <p className="text-sm text-gray-600">まずはアカウントを作成して学習を開始</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-blue-300 text-2xl">→</div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-bold text-gray-900 mb-2">動画学習</h3>
                <p className="text-sm text-gray-600">オンラインで基礎から応用まで学習</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-blue-300 text-2xl">→</div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-bold text-gray-900 mb-2">実践OJT</h3>
                <p className="text-sm text-gray-600">現場で実践的なスキルを身につける</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-blue-300 text-2xl">→</div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="font-bold text-gray-900 mb-2">認定取得</h3>
                <p className="text-sm text-gray-600">試験に合格してDOCOTAN認定資格を取得</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructors Preview */}
        {instructors.length > 0 && (
          <div className="mb-20">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">講師陣</h2>
                <p className="text-gray-600">経験豊富なプロフェッショナルから学ぶ</p>
              </div>
              <Link
                href="/instructors"
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                すべて見る →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {instructors.map((instructor: any) => (
                <Link
                  key={instructor._id}
                  href={`/instructors/${instructor._id}`}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center transform hover:-translate-y-1"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
                    {instructor.avatarUrl ? (
                      <img
                        src={instructor.avatarUrl}
                        alt={instructor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {instructor.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {instructor.name}
                  </h3>
                  {instructor.title && (
                    <p className="text-sm text-gray-600 mt-1">{instructor.title}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            今すぐ探偵への第一歩を踏み出そう
          </h2>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
            DOCOTAN探偵学校で、プロの探偵として活躍するための知識とスキルを身につけましょう。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              無料で登録する
            </Link>
            <Link
              href="/videos"
              className="px-8 py-4 bg-blue-500/30 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-500/40 transform hover:scale-105 transition-all border border-white/30"
            >
              コースを見る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
