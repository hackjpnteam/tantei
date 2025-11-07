'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUsers, FaPlay, FaUser, FaSignOutAlt, FaSignInAlt, FaCog, FaUserFriends } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function WorkingNavigation() {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Directly fetch session data on mount using simple auth
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth-simple/session');
        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error('Session fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
    
    // Refetch session every 5 seconds to catch updates
    const interval = setInterval(fetchSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/', label: 'ホーム', icon: FaHome },
    { href: '/instructors', label: 'ゲスト', icon: FaUsers },
    { href: '/videos', label: '動画', icon: FaPlay },
    { href: '/members', label: '会員一覧', icon: FaUserFriends, authRequired: true },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth-simple/logout', { method: 'POST' });
      toast.success('ログアウトしました');
      setSession(null);
      window.location.href = '/';
    } catch (error) {
      toast.error('ログアウトに失敗しました');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <img 
              src="/n-minus-logo-final.png" 
              alt="DOCOTAN探偵学校" 
              className="h-12 w-auto object-contain"
            />
          </Link>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.authRequired && !session?.user) return null;
              
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-theme-100 text-theme-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}

            <div className="ml-4 pl-4 border-l border-gray-200">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : session?.user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/mypage"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all"
                  >
                    <FaUser />
                    <span className="hidden sm:block text-sm font-medium">マイページ</span>
                  </Link>
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-xl transition-all"
                    >
                      <FaCog />
                      <span className="hidden sm:block text-sm font-medium">管理</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all"
                    title="ログアウト"
                  >
                    <FaSignOutAlt />
                    <span className="hidden sm:block text-sm">ログアウト</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 px-3 py-2 text-theme-800 hover:bg-theme-50 rounded-xl transition-all"
                  >
                    <FaSignInAlt />
                    <span className="hidden sm:block text-sm">ログイン</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-2 px-3 py-2 bg-theme-800 text-white hover:bg-theme-700 rounded-xl transition-all"
                  >
                    <FaUser />
                    <span className="hidden sm:block text-sm">登録</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}