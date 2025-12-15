'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/lib/useSimpleAuth';
import Link from 'next/link';
import { FaSave, FaArrowLeft, FaImage, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Instructor {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  code: string;
  title: string;
}

export default function EditVideoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading } = useSimpleAuth(true); // Require admin
  const [saving, setSaving] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    instructor: '',
    course: '',
    stats: {
      views: 0,
      avgWatchRate: 0
    }
  });

  useEffect(() => {
    if (user) {
      fetchInstructors();
      fetchCourses();
      fetchVideo();
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

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/admin/videos/${params.id}`);
      if (!response.ok) {
        throw new Error('動画が見つかりません');
      }
      const data = await response.json();
      setFormData({
        ...data,
        instructor: data.instructor?._id || data.instructor || '',
        course: data.course?._id || data.course || ''
      });
    } catch (error) {
      console.error('Error fetching video:', error);
      toast.error('動画データの取得に失敗しました');
      router.push('/admin/videos');
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ファイルサイズは5MB以下にしてください');
      return;
    }

    setThumbnailFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadThumbnail = async (): Promise<string> => {
    if (!thumbnailFile) return formData.thumbnailUrl || '/default-thumbnail.png';

    setUploadingThumbnail(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', thumbnailFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('アップロードに失敗しました');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('サムネイルのアップロードに失敗しました');
      return formData.thumbnailUrl || '/default-thumbnail.png';
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload thumbnail if file is selected
      let thumbnailUrl = formData.thumbnailUrl;
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail();
      }

      const response = await fetch(`/api/admin/videos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          thumbnailUrl: thumbnailUrl || '/default-thumbnail.png'
        }),
      });

      if (!response.ok) {
        throw new Error('更新に失敗しました');
      }

      toast.success('動画情報を更新しました');
      router.push('/admin/videos');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('更新に失敗しました');
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
        <h1 className="text-3xl font-bold text-gray-900">動画編集</h1>
        <p className="text-gray-600 mt-2">動画情報を編集します</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイトル
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-theme-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-theme-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            講師
          </label>
          <select
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            {instructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.name}
              </option>
            ))}
          </select>
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
            サムネイル画像
          </label>
          <div className="space-y-3">
            {/* Current thumbnail */}
            {formData.thumbnailUrl && !thumbnailPreview && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={formData.thumbnailUrl}
                  alt="Current thumbnail"
                  className="w-full h-full object-cover"
                />
                <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  現在のサムネイル
                </p>
              </div>
            )}

            {/* File upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload-edit"
              />
              <label
                htmlFor="thumbnail-upload-edit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-theme-500 transition-colors"
              >
                <FaImage className="text-gray-400" />
                <span className="text-gray-600">
                  {thumbnailFile ? thumbnailFile.name : '新しい画像を選択またはドラッグ＆ドロップ'}
                </span>
              </label>
            </div>

            {/* Preview */}
            {thumbnailPreview && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={thumbnailPreview}
                  alt="New thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  新しいサムネイル
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailPreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* URL input (optional) */}
            <div>
              <p className="text-sm text-gray-500 mb-2">または、画像URLを直接入力：</p>
              <input
                type="text"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-theme-500 focus:border-transparent"
                placeholder="例: https://images.unsplash.com/..."
                disabled={!!thumbnailFile}
              />
            </div>
            
            <p className="text-xs text-gray-500">
              ※ 画像を指定しない場合は、デフォルトのサムネイルが使用されます
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            動画URL（YouTube または Vimeo）
          </label>
          <input
            type="text"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-theme-500 focus:border-transparent"
            placeholder="例: https://www.youtube.com/watch?v=... または https://vimeo.com/..."
          />
          <p className="text-xs text-gray-500 mt-1">
            YouTubeまたはVimeoの動画URLを入力してください
          </p>
        </div>


        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || uploadingThumbnail}
            className="flex items-center gap-2 bg-theme-600 text-white px-6 py-2 rounded-xl hover:bg-theme-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaSave />
            {uploadingThumbnail ? 'アップロード中...' : saving ? '保存中...' : '保存'}
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