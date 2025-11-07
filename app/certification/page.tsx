'use client';

import Link from 'next/link';

export default function CertificationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">認定制度</h1>
        
        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">DOCOTAN Certified Detective (DCD)</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            修了後は審査を経て、DOCOTAN Certified Detective（DCD）を付与。プロフィールにバッジ表示・認定番号付与。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                🥇
              </div>
              <h3 className="text-xl font-bold">DCD-Basic</h3>
            </div>
            <p className="text-gray-600 mb-4">
              基礎コース修了者向けの認定資格。探偵業の基本的な知識と技術を習得したことを証明します。
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 探偵業法の理解</li>
              <li>• 基本的な調査技術</li>
              <li>• 倫理・コンプライアンス</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mr-4">
                🏆
              </div>
              <h3 className="text-xl font-bold">DCD-Pro</h3>
            </div>
            <p className="text-gray-600 mb-4">
              プロコース修了者向けの上級認定資格。実践的な調査技術と案件対応力を証明します。
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 実地調査経験</li>
              <li>• 報告書作成技術</li>
              <li>• 案件管理能力</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold mb-4">審査プロセス</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold mb-2">オンライン試験</h4>
              <p className="text-sm text-gray-600">知識確認テスト</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold mb-2">OJT評価</h4>
              <p className="text-sm text-gray-600">実践技術の評価</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold mb-2">コンプライアンステスト</h4>
              <p className="text-sm text-gray-600">倫理・法令遵守の確認</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-3">認定維持について</h3>
          <p className="text-gray-700">
            年1回のアップデート研修受講で認定維持が可能です。最新の法改正や技術トレンドを継続的に学習し、
            プロフェッショナルとしてのスキルを維持してください。
          </p>
        </div>

        <div className="text-center">
          <Link 
            href="/contact" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            認定制度について詳しく問い合わせる
          </Link>
        </div>
      </div>
    </div>
  );
}