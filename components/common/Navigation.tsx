'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUsers, FaPlay, FaChartBar, FaUser, FaSignOutAlt, FaSignInAlt, FaCog, FaUserFriends } from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debug session state
  console.log('🔍 Navigation Debug:', {
    status,
    sessionExists: !!session,
    userExists: !!session?.user,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    mounted,
    pathname
  });
  
  // Don't render auth-dependent content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <img 
                src="/n-minus-logo-final.png" 
                alt="DOCOTAN探偵スクール" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center space-x-1">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }
  

  const navItems = [
    { href: '/', label: 'ホーム', icon: FaHome },
    { href: '/instructors', label: '講師', icon: FaUsers },
    { href: '/videos', label: 'コース', icon: FaPlay },
    { href: '/certification', label: '認定制度', icon: FaChartBar },
    { href: '/contact', label: 'お問い合わせ', icon: FaUserFriends },
  ] as Array<{
    href: string;
    label: string;
    icon: any;
    authRequired?: boolean;
    adminRequired?: boolean;
  }>;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('ログアウトしました');
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
              alt="DOCOTAN探偵スクール" 
              className="h-12 w-auto object-contain"
            />
          </Link>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              // Debug: Log each navigation item processing
              console.log('🔍 NavItem:', item.label, {
                authRequired: item.authRequired,
                adminRequired: item.adminRequired,
                hasSession: !!session?.user,
                userRole: session?.user?.role,
                shouldSkip: (item.authRequired && !session?.user) || (item.adminRequired && (!session?.user || session.user.role !== 'admin'))
              });
              
              // Skip auth-required items if user is not logged in
              if (item.authRequired && !session?.user) return null;
              // Skip admin-required items if user is not admin
              if (item.adminRequired && (!session?.user || session.user.role !== 'admin')) return null;
              
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
              {status === 'loading' ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : session?.user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/mypage"
                    className="flex items-center justify-center w-10 h-10 xl:w-auto xl:h-auto xl:gap-2 xl:px-3 xl:py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all"
                    title="マイページ"
                  >
                    <FaUser className="text-lg xl:text-base" />
                    <span className="hidden xl:block text-sm font-medium">マイページ</span>
                  </Link>
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-center w-10 h-10 xl:w-auto xl:h-auto xl:gap-2 xl:px-3 xl:py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-xl transition-all"
                      title="管理"
                    >
                      <FaCog className="text-lg xl:text-base" />
                      <span className="hidden xl:block text-sm font-medium">管理</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-10 xl:w-auto xl:h-auto xl:gap-2 xl:px-3 xl:py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all"
                    title="ログアウト"
                  >
                    <FaSignOutAlt className="text-lg xl:text-base" />
                    <span className="hidden xl:block text-sm">ログアウト</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center w-10 h-10 xl:w-auto xl:h-auto xl:gap-2 xl:px-3 xl:py-2 text-theme-800 hover:bg-theme-50 rounded-xl transition-all"
                    title="ログイン"
                  >
                    <FaSignInAlt className="text-lg xl:text-base" />
                    <span className="hidden xl:block text-sm">ログイン</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center w-10 h-10 xl:w-auto xl:h-auto xl:gap-2 xl:px-3 xl:py-2 bg-theme-800 text-white hover:bg-theme-700 rounded-xl transition-all"
                    title="登録"
                  >
                    <FaUser className="text-lg xl:text-base" />
                    <span className="hidden xl:block text-sm">登録</span>
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