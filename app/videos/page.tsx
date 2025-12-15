'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaFilter } from 'react-icons/fa';

interface Course {
  _id: string;
  code: string;
  title: string;
  description: string;
  priceJPY: number;
  durationDays: number;
}

export default function VideosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourse = searchParams.get('course') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(initialCourse);
  const [videos, setVideos] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [searchTerm, selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCourse) params.append('course', selectedCourse);

      const response = await fetch(`/api/videos?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();

      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP').format(price);
  };

  const formatDuration = (days: number) => {
    if (days === 0) return '随時';
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months}ヶ月`;
    }
    return `${days}日`;
  };

  const selectedCourseData = courses.find(c => c._id === selectedCourse);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">動画一覧</h1>
          <Link
            href="/courses"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            コース詳細を見る →
          </Link>
        </div>

        {/* Course Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">コースで絞り込み</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedCourse('')}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedCourse === ''
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white hover:bg-blue-50 border border-gray-200'
              }`}
            >
              <div className="font-bold mb-1">すべての動画</div>
              <div className={`text-sm ${selectedCourse === '' ? 'text-blue-100' : 'text-gray-500'}`}>
                全コースの動画を表示
              </div>
            </button>

            {courses.map((course) => (
              <button
                key={course._id}
                onClick={() => setSelectedCourse(course._id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedCourse === course._id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white hover:bg-blue-50 border border-gray-200'
                }`}
              >
                <div className="font-bold mb-1">{course.title}</div>
                <div className={`text-sm ${selectedCourse === course._id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatPrice(course.priceJPY)}円 / {formatDuration(course.durationDays)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Course Info */}
        {selectedCourseData && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-2">
                  {selectedCourseData.code}
                </span>
                <h2 className="text-2xl font-bold mb-2">{selectedCourseData.title}</h2>
                <p className="text-blue-100">{selectedCourseData.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {selectedCourseData.priceJPY === 33000 ? (
                    <span>{formatPrice(selectedCourseData.priceJPY)}円〜</span>
                  ) : (
                    <span>{formatPrice(selectedCourseData.priceJPY)}円</span>
                  )}
                </div>
                <div className="text-blue-100 text-sm">(税込)</div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="動画を検索..."
              className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {videos.length}件の動画が見つかりました
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link key={video._id} href={`/videos/${video._id}`}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{video.instructor?.name || '講師未設定'}</span>
                      <span className="text-gray-400">{Math.floor((video.durationSec || 0) / 60)}分</span>
                    </div>
                    {video.course && (
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {courses.find(c => c._id === video.course)?.title || 'コース'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">動画が見つかりませんでした</p>
            {selectedCourse && (
              <button
                onClick={() => setSelectedCourse('')}
                className="text-blue-600 hover:text-blue-800"
              >
                すべての動画を表示
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
