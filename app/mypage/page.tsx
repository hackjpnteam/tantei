'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaVideo, FaCheckCircle, FaClock, FaTrophy, FaBook, FaChartLine, FaPlay, FaHistory, FaCog, FaEdit, FaSave, FaBuilding, FaBriefcase, FaGlobe, FaCamera, FaBookmark } from 'react-icons/fa';
import useSWR from 'swr';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [completedVideoDetails, setCompletedVideoDetails] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'completed'>('saved');
  const [profileData, setProfileData] = useState({
    name: '',
    company: '',
    position: '',
    companyUrl: '',
    bio: '',
    avatarUrl: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Check authentication using NextAuth session API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try NextAuth session first
        const nextAuthResponse = await fetch('/api/auth/session');
        const nextAuthData = await nextAuthResponse.json();
        
        console.log('🔍 MyPage - NextAuth response:', nextAuthData);
        
        if (nextAuthData && nextAuthData.user && nextAuthData.user.email) {
          console.log('✅ NextAuth session found with email:', nextAuthData.user.email);
          setUser(nextAuthData.user);
          setProfileData({
            name: nextAuthData.user.name || '',
            company: '',
            position: '',
            companyUrl: '',
            bio: '',
            avatarUrl: nextAuthData.user.image || ''
          });
          setLoading(false);
          return;
        } else {
          console.log('❌ NextAuth session invalid or missing email:', nextAuthData);
        }
        
        // Fallback to auth-simple session
        const response = await fetch('/api/auth-simple/session');
        const sessionData = await response.json();
        
        if (!sessionData || !sessionData.user) {
          console.log('❌ No session found, redirecting to login');
          window.location.href = '/auth/login';
          return;
        }

        console.log('✅ Auth-simple session found:', sessionData.user);
        setUser(sessionData.user);
        setProfileData({
          name: sessionData.user.name || '',
          company: '',
          position: '',
          companyUrl: '',
          bio: '',
          avatarUrl: sessionData.user.image || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/auth/login';
      }
    };

    checkAuth();
  }, []);

  // Fetch user profile and saved videos from API
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchSavedVideos();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const profile = data.user.profile || {};
        setProfileData({
          name: data.user.name || user?.name || '',
          company: profile.company || '',
          position: profile.position || '',
          companyUrl: profile.companyUrl || '',
          bio: profile.bio || '',
          avatarUrl: profile.avatarUrl || user?.image || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };


  const fetchSavedVideos = async () => {
    try {
      const response = await fetch('/api/saved-videos', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSavedVideos(data.savedVideos || []);
      } else {
        console.error('Failed to fetch saved videos');
      }
    } catch (error) {
      console.error('Error fetching saved videos:', error);
      // Fallback to localStorage for backward compatibility
      const savedData = localStorage.getItem('savedVideos');
      if (savedData) {
        setSavedVideos(JSON.parse(savedData));
      }
    }
  };


  const saveVideo = async (videoId: string, videoData: any) => {
    try {
      const response = await fetch('/api/saved-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ videoId, videoData })
      });

      if (response.ok) {
        const data = await response.json();
        setSavedVideos(data.savedVideos);
        toast.success('動画を保存しました！');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('保存中にエラーが発生しました');
    }
  };

  const removeSavedVideo = async (videoId: string) => {
    try {
      const response = await fetch(`/api/saved-videos?videoId=${videoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSavedVideos(data.savedVideos);
        toast.success('保存を解除しました');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Error removing saved video:', error);
      toast.error('削除中にエラーが発生しました');
    }
  };

  const fetchCompletedVideoDetails = async () => {
    try {
      console.log('🎬 MyPage: Fetching completed video details...');
      const response = await fetch('/api/completed-videos', {
        credentials: 'include'
      });
      
      console.log('🎬 MyPage: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎬 MyPage: Completed videos data:', data);
        console.log('🎬 MyPage: Videos array length:', data.videos?.length || 0);
        console.log('🎬 MyPage: Setting state with videos:', data.videos);
        setCompletedVideoDetails(data.videos || []);
        console.log('🎬 MyPage: State set completed');
      } else {
        console.error('🎬 MyPage: Failed to fetch completed video details - Status:', response.status);
        const errorText = await response.text();
        console.error('🎬 MyPage: Error response:', errorText);
        setCompletedVideoDetails([]);
      }
    } catch (error) {
      console.error('🎬 MyPage: Error fetching completed video details:', error);
      setCompletedVideoDetails([]);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('🔄 MyPage: User detected, fetching completed videos...');
      fetchCompletedVideoDetails();
    }
  }, [user]);


  const handleSaveProfile = async () => {
    console.log('Starting profile save...');
    console.log('Profile data to save:', profileData);
    setSavingProfile(true);
    try {
      console.log('Making API call to /api/profile...');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Profile saved successfully:', data);
        setUser(data.user);
        // Refresh the profile data to ensure it's up to date
        await fetchUserProfile();
        toast.success('プロフィールを保存しました！');
        setEditingProfile(false);
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        toast.error(errorData.error || 'プロフィールの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('プロフィールの保存中にエラーが発生しました');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset profile data to original values
    setProfileData({
      name: user.name || '',
      company: user.profile?.company || '',
      position: user.profile?.position || '',
      companyUrl: user.profile?.companyUrl || '',
      bio: user.profile?.bio || '',
      avatarUrl: user.profile?.avatarUrl || ''
    });
    setEditingProfile(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Starting avatar upload...');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful, avatar URL:', data.avatarUrl);
        
        // Update profileData state for immediate UI update
        setProfileData({ ...profileData, avatarUrl: data.avatarUrl });
        
        // Save the avatar URL to user profile
        const updatedProfileData = { 
          name: user.name,
          company: user.profile?.company || '',
          position: user.profile?.position || '',
          companyUrl: user.profile?.companyUrl || '',
          bio: user.profile?.bio || '',
          avatarUrl: data.avatarUrl 
        };
        
        const saveResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updatedProfileData)
        });

        console.log('Profile save response status:', saveResponse.status);
        
        if (saveResponse.ok) {
          const savedData = await saveResponse.json();
          console.log('Profile saved successfully:', savedData);
          setUser(savedData.user);
          toast.success('プロフィール画像を保存しました！');
        } else {
          console.error('Failed to save profile with avatar');
          toast.error('プロフィールの保存に失敗しました');
        }
        
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        toast.error(errorData.error || 'アップロードに失敗しました');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('アップロード中にエラーが発生しました');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get video details (real data only)
  const getVideoDetails = (videoId: string) => {
    const realVideo = completedVideoDetails.find(v => v._id === videoId || v.id === videoId);
    if (realVideo) {
      return {
        title: realVideo.title,
        instructor: realVideo.instructor?.name || '講師名',
        thumbnailUrl: realVideo.thumbnailUrl
      };
    }
    // Return null if no real video data found
    return null;
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">リダイレクト中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">マイページ</h1>
          <p className="text-gray-600">あなたの学習状況を確認できます</p>
        </div>
        {(user.roles?.includes('admin') || user.roles?.includes('superadmin')) && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
          >
            <FaCog />
            管理画面
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                {user.profile?.avatarUrl ? (
                  <Image
                    src={user.profile.avatarUrl}
                    alt="プロフィール画像"
                    fill
                    className="rounded-full object-cover border-2 border-blue-300"
                    sizes="48px"
                    onError={(e) => {
                      console.error('Failed to load avatar:', user.profile.avatarUrl);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
              </div>
              <div 
                className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ display: user.profile?.avatarUrl ? 'none' : 'flex' }}
              >
                {user.name.charAt(0)}
              </div>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="text-blue-100 hover:text-white transition-colors"
              title="プロフィール編集"
            >
              <FaEdit />
            </button>
          </div>
          <h3 className="text-xl font-bold mb-1">{user.name}</h3>
          <p className="text-blue-100">{user.email}</p>
          {user.profile?.company && (
            <p className="text-blue-100 text-sm mt-2">{user.profile.company}</p>
          )}
          {user.profile?.position && (
            <p className="text-blue-100 text-sm">{user.profile.position}</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FaCheckCircle className="text-2xl" />
            <span className="text-green-100">完了動画</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {completedVideoDetails.length}
          </h3>
          <p className="text-green-100">本完了</p>
        </div>

      </div>

      {/* 学習コンテンツタブセクション */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaHistory className="text-orange-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">学習コンテンツ</h2>
          </div>
          
          {/* タブナビゲーション */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeTab === 'saved'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaBookmark className="inline mr-1" />
              保存済み
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeTab === 'completed'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaCheckCircle className="inline mr-1" />
              完了済み
            </button>
          </div>
        </div>
        

        {/* 保存済みタブ */}
        {activeTab === 'saved' && (
          savedVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedVideos.slice(0, 6).map((item: any, index: number) => (
                <Link
                  key={item.id || `saved-${index}`}
                  href={`/videos/${item.id}`}
                  className="group"
                >
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all group-hover:shadow-md">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden relative">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FaBookmark className="text-4xl text-blue-500" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {item.title || '動画タイトル'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {item.instructor?.name || '講師名'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        保存済み
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeSavedVideo(item.id);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                          title="保存解除"
                        >
                          削除
                        </button>
                        <p className="text-xs text-gray-500">
                          {new Date(item.savedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBookmark className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">保存済みの動画がありません</p>
              <Link
                href="/videos"
                className="inline-flex items-center gap-2 bg-theme-600 text-white px-4 py-2 rounded-xl hover:bg-theme-700 transition-all"
              >
                <FaPlay />
                動画を探す
              </Link>
            </div>
          )
        )}

        {/* 完了済みタブ */}
        {activeTab === 'completed' && (
          completedVideoDetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedVideoDetails.slice(0, 6).map((video: any, index: number) => (
                <Link
                  key={video.id || video._id || `completed-${index}`}
                  href={`/videos/${video.id || video._id}`}
                  className="group"
                >
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all group-hover:shadow-md">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden relative">
                      {video.thumbnailUrl ? (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FaCheckCircle className="text-4xl text-green-500" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {video.instructor?.name || '講師名'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        完了済み
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(video.completedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            ) : (
              <div className="text-center py-12">
                <FaCheckCircle className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">完了済みの動画がありません</p>
                <Link
                  href="/videos"
                  className="inline-flex items-center gap-2 bg-theme-600 text-white px-4 py-2 rounded-xl hover:bg-theme-700 transition-all"
                >
                  <FaPlay />
                  動画を見る
                </Link>
              </div>
            )
        )}
      </div>

      {/* プロフィール編集モーダル */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">プロフィール編集</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* プロフィール画像 */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="relative w-20 h-20">
                      {profileData.avatarUrl ? (
                        <Image
                          src={profileData.avatarUrl}
                          alt="プロフィール画像"
                          fill
                          className="rounded-full object-cover border-4 border-gray-200"
                          sizes="80px"
                          onError={(e) => {
                            console.error('Failed to load profile image:', profileData.avatarUrl);
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                    </div>
                    <div 
                      className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold"
                      style={{ display: profileData.avatarUrl ? 'none' : 'flex' }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                      <FaCamera className="text-xs" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    クリックして画像を変更（最大5MB、JPEG/PNG/GIF/WebP）
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    お名前
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="お名前を入力してください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaBuilding className="inline mr-2" />
                    会社名
                  </label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="会社名を入力してください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaBriefcase className="inline mr-2" />
                    役職
                  </label>
                  <input
                    type="text"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="役職を入力してください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaGlobe className="inline mr-2" />
                    会社URL
                  </label>
                  <input
                    type="url"
                    value={profileData.companyUrl}
                    onChange={(e) => setProfileData({ ...profileData, companyUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自己紹介
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="自己紹介を入力してください"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      保存中...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      保存する
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}