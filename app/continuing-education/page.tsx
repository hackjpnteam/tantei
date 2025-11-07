import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '継続教育・年次アップデート研修 | DOCOTAN探偵スクール',
  description: 'DCD認定者向け継続教育プログラム。最新の法改正/技術（AI・SNS・位置情報）を年1回キャッチアップ。',
};

export default function ContinuingEducationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">継続教育・年次アップデート研修</h1>
        
        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">目的</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            最新の法改正/技術（AI・SNS・位置情報）を年1回キャッチアップ。DCD認定者の継続的なスキル向上を支援します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">📋 受講条件</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• DCD認定者（Basic/Pro問わず）</li>
              <li>• 年1回の受講が必要</li>
              <li>• オンライン・対面どちらでも可</li>
              <li>• 認定維持のための必須研修</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">🎯 更新要件</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• 年1回受講で認定維持</li>
              <li>• 研修修了証の発行</li>
              <li>• 継続教育単位の付与</li>
              <li>• 最新認定バッジの更新</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold mb-6">参考テーマ（2024年度）</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">法令・制度更新</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 個人情報保護法の改正点</li>
                <li>• 探偵業法関連通達</li>
                <li>• データ利用規制の動向</li>
                <li>• 国際調査時の法的留意点</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">技術・手法更新</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• SNS調査の最新手法</li>
                <li>• AI画像解析の活用</li>
                <li>• デジタルフォレンジック入門</li>
                <li>• 報告書フォーマット更新</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-3">開催スケジュール</h3>
          <div className="text-gray-700">
            <p className="mb-3">年4回開催（3月・6月・9月・12月）</p>
            <ul className="space-y-2 text-sm">
              <li>• オンライン研修：各月第2土曜日 10:00-16:00</li>
              <li>• 対面研修：東京・大阪・名古屋で開催</li>
              <li>• 録画視聴：研修後2週間アーカイブ視聴可能</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-3">受講料</h3>
          <div className="text-gray-700">
            <div className="text-2xl font-bold text-green-600 mb-2">19,800円（税込）/年</div>
            <ul className="space-y-2 text-sm">
              <li>• DCD認定者特別価格</li>
              <li>• 年間パスで4回すべて受講可能</li>
              <li>• 単発受講：5,500円/回</li>
              <li>• 企業研修：別途お見積り</li>
            </ul>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-3 text-red-700">重要な注意事項</h3>
          <p className="text-red-600">
            継続教育を受講しない場合、DCD認定資格は失効となります。認定維持のため、
            必ず年1回以上の受講をお願いいたします。
          </p>
        </div>

        <div className="text-center">
          <Link 
            href="/contact" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            継続教育について詳しく問い合わせる
          </Link>
        </div>
      </div>
    </div>
  );
}