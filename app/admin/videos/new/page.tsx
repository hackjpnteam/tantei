'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/lib/useSimpleAuth';
import Link from 'next/link';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Instructor {
  _id: string;
  name: string;
  avatarUrl?: string;
}

interface Course {
  _id: string;
  code: string;
  title: string;
}

export default function NewVideoPage() {
  const router = useRouter();
  const { user, loading } = useSimpleAuth(true); // Require admin
  const [saving, setSaving] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceUrl: '',
    instructor: '',
    course: ''
  });

  useEffect(() => {
    if (user) {
      fetchInstructors();
      fetchCourses();
    }
  }, [user]);

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/instructors');
      const data = await response.json();
      setInstructors(data.instructors || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Find the selected instructor object
      const selectedInstructor = instructors.find(inst => inst._id === formData.instructor);
      if (!selectedInstructor) {
        toast.error('講師を選択してください');
        setSaving(false);
        return;
      }

      // Prepare data in the format expected by the API
      const videoData = {
        ...formData,
        instructor: {
          _id: selectedInstructor._id,
          name: selectedInstructor.name,
          avatarUrl: selectedInstructor.avatarUrl || 'https://via.placeholder.com/150'
        },
        course: formData.course || null
      };

      console.log('Sending video data:', videoData);

      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(videoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '追加に失敗しました');
      }

      toast.success('動画を追加しました');
      router.push('/admin/videos');
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error(error instanceof Error ? error.message : '追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">動画追加</h1>
        <p className="text-gray-600 mt-2">新しい研修動画を追加します</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-theme-500 focus:border-transparent"
            placeholder="例: IPO準備における内部統制の構築"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-theme-500 focus:border-transparent"
            placeholder="動画の内容や学習目標について詳しく記載してください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            講師 <span className="text-red-500">*</span>
          </label>
          <select
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-theme-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            {instructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.name}
              </option>
            ))}
          </select>
          {instructors.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              講師が登録されていません。先に講師を追加してください。
            </p>
          )}
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コース
          </label>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">コースなし（単体動画）</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            動画URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="sourceUrl"
            value={formData.sourceUrl}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: https://example.com/videos/video.mp4"
          />
        </div>


        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || instructors.length === 0}
            className="flex items-center gap-2 bg-theme-600 text-white px-6 py-2 rounded-xl hover:bg-theme-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaSave />
            {saving ? '追加中...' : '追加'}
          </button>
          <Link
            href="/admin/videos"
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition-all"
          >
            <FaArrowLeft />
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}