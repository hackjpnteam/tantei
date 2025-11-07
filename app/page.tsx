import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-theme-400/20 to-theme-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-theme-400/20 to-theme-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="mb-8 flex justify-center items-center">
            <img 
              src="/n-minus-logo-final.png" 
              alt="DOCOTAN探偵学校" 
              className="h-32 w-auto object-contain"
            />
          </div>
          
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              探偵の知識とスキルを、すべての人に。
            </h1>
            <p className="text-xl text-theme-700 font-medium">
              現役プロと学ぶ、民間探偵の実践型ハイブリッド教育。基礎からOJT、認定まで。
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-white/70 backdrop-blur rounded-full text-gray-700 border border-white/50">🎯 オンライン×OJT</span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur rounded-full text-gray-700 border border-white/50">👨‍💼 現役講師陣</span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur rounded-full text-gray-700 border border-white/50">🏆 認定バッジ</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Link
            href="/instructors"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-theme-700 to-theme-800 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 text-center transform group-hover:scale-105 group-hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-theme-600 to-theme-800 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                👨‍🏫
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-theme-800 transition-colors">
                講師陣
              </h2>
              <p className="text-gray-600 leading-relaxed">
                現役探偵・警察OB・法務専門家が実践的指導を提供します
              </p>
              <div className="mt-6">
                <span className="inline-block px-4 py-2 bg-theme-100 text-theme-700 rounded-full text-sm font-medium">
                  詳細を見る →
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/videos"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-theme-700 to-theme-800 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 text-center transform group-hover:scale-105 group-hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-theme-600 to-theme-800 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                🎥
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-theme-800 transition-colors">
                コース
              </h2>
              <p className="text-gray-600 leading-relaxed">
                基礎からプロまで、段階的に探偵スキルを習得できるカリキュラム
              </p>
              <div className="mt-6">
                <span className="inline-block px-4 py-2 bg-theme-100 text-theme-700 rounded-full text-sm font-medium">
                  詳細を見る →
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/certification"
            className="relative group block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-theme-700 to-theme-800 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 text-center transform group-hover:scale-105 group-hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-theme-600 to-theme-800 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                🏆
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-theme-800 transition-colors">
                認定制度
              </h2>
              <p className="text-gray-600 leading-relaxed">
                修了後はDCD-Basic/DCD-Pro認定バッジを取得し、プロフィールに表示
              </p>
              <div className="mt-6">
                <span className="inline-block px-4 py-2 bg-theme-100 text-theme-700 rounded-full text-sm font-medium">
                  詳細を見る →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}