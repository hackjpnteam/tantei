'use client';

import Link from 'next/link';

export default function PolicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">警察OB向け短期認定プログラム</h1>
        
        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">退職警察官の民間転身支援</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            2日間集中：民間探偵業の法令・契約・調査技術の差分理解。修了証発行。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">🎯 プログラム概要</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• 2日間の集中研修（土日開催）</li>
              <li>• 民間探偵業への転身サポート</li>
              <li>• 修了証の発行</li>
              <li>• フォローアップ相談付き</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">📚 カリキュラム</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• 探偵業法と公務員時代の差分</li>
              <li>• 民間契約の基礎知識</li>
              <li>• 調査技術の応用と制約</li>
              <li>• 開業・就職支援情報</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold mb-4">スケジュール例</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">1日目</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>10:00-12:00 探偵業法の基礎</li>
                <li>13:00-15:00 民間調査の実務</li>
                <li>15:30-17:00 契約・料金設定</li>
                <li>17:00-18:00 質疑応答・交流会</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">2日目</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>10:00-12:00 調査技術の応用</li>
                <li>13:00-15:00 報告書作成実習</li>
                <li>15:30-17:00 開業・転職支援</li>
                <li>17:00-18:00 修了証授与・総括</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-3">対象者</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• 警察官OBの方（退職予定含む）</li>
            <li>• 探偵業への転身を検討中の方</li>
            <li>• 民間調査業界に興味のある方</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-3">受講料・特典</h3>
          <div className="text-gray-700">
            <div className="text-2xl font-bold text-green-600 mb-2">特別価格：49,800円（税込）</div>
            <ul className="space-y-2 text-sm">
              <li>• 警察OB特別割引適用</li>
              <li>• 修了証発行</li>
              <li>• 3ヶ月間のフォローアップ相談</li>
              <li>• DOCOTAN探偵スクール本科への優待価格適用</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/contact" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            プログラム詳細を問い合わせ
          </Link>
        </div>
      </div>
    </div>
  );
}