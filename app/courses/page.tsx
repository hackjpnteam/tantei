import Link from 'next/link';
import connectToMongoDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Video from '@/models/Video';
import { FaClock, FaYenSign, FaPlay, FaChevronRight } from 'react-icons/fa';

async function getCoursesWithVideos() {
  try {
    await connectToMongoDB();

    const courses = await Course.find({ visible: true })
      .sort({ code: 1 })
      .lean();

    const coursesWithVideos = await Promise.all(
      courses.map(async (course) => {
        const videos = await Video.find({ course: course._id })
          .select('title thumbnailUrl durationSec')
          .sort({ createdAt: 1 })
          .lean();

        return {
          ...course,
          _id: course._id.toString(),
          videos: videos.map(v => ({
            ...v,
            _id: v._id.toString()
          }))
        };
      })
    );

    return JSON.parse(JSON.stringify(coursesWithVideos));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP').format(price);
}

function formatDuration(days: number): string {
  if (days === 0) return '随時';
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months}ヶ月`;
  }
  return `${days}日`;
}

export default async function CoursesPage() {
  const courses = await getCoursesWithVideos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">コース一覧</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            DOCOTAN探偵学校では、初心者から上級者まで、段階的にスキルを身につけられるコースをご用意しています。
          </p>
        </div>

        {/* Courses Grid */}
        <div className="space-y-12">
          {courses.map((course: any) => (
            <div
              key={course._id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Course Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-2">
                      {course.code}
                    </span>
                    <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
                    <p className="text-blue-100 max-w-2xl">{course.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-3xl font-bold">
                      {course.priceJPY === 33000 ? (
                        <span>{formatPrice(course.priceJPY)}円〜</span>
                      ) : (
                        <span>{formatPrice(course.priceJPY)}円</span>
                      )}
                    </div>
                    <div className="text-blue-100 text-sm">(税込)</div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <FaClock />
                      <span>期間: {formatDuration(course.durationDays)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Syllabus */}
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">カリキュラム</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {course.syllabus.map((item: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos */}
              {course.videos.length > 0 && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      コース動画 ({course.videos.length}本)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {course.videos.slice(0, 6).map((video: any) => (
                      <Link
                        key={video._id}
                        href={`/videos/${video._id}`}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                              <FaPlay className="text-white text-xs" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                            {video.title}
                          </p>
                        </div>
                        <FaChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                  {course.videos.length > 6 && (
                    <div className="mt-4 text-center">
                      <Link
                        href={`/videos?course=${course._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        すべての動画を見る ({course.videos.length}本) →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="px-8 pb-8">
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">コースがまだ登録されていません。</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              まずは無料で始めてみませんか？
            </h2>
            <p className="text-gray-600 mb-6">
              アカウント登録後、一部のコンテンツを無料でご覧いただけます。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                無料で登録する
              </Link>
              <Link
                href="/videos"
                className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                動画一覧を見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
