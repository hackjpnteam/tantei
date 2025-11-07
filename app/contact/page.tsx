'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // フォームAPIにPOSTを試行
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (response.ok) {
        alert('お問い合わせを受け付けました。2営業日以内にご連絡いたします。');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      // フォールバック: mailto:でメール送信
      const mailtoSubject = encodeURIComponent(`[DOCOTAN探偵スクール] ${subject || 'お問い合わせ'}`);
      const mailtoBody = encodeURIComponent(
        `お名前: ${name}\n` +
        `メールアドレス: ${email}\n` +
        `件名: ${subject}\n\n` +
        `メッセージ:\n${message}`
      );
      
      const mailtoLink = `mailto:info@docotan-detective.jp?subject=${mailtoSubject}&body=${mailtoBody}`;
      window.location.href = mailtoLink;
      
      alert('メールアプリが開きます。送信を完了してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">無料説明会・お問い合わせ</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ご相談はオンライン可。法人研修・取材もこちらから。</h2>
          <p className="text-gray-600 mb-6">
            DOCOTAN探偵スクールへのご質問、コースの詳細、無料説明会の予約など、お気軽にお問い合わせください。
            通常1営業日以内にご返信いたします。
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">連絡先情報</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>DOCOTAN探偵スクール 事務局</p>
              <p>相談受付: 平日 10:00-18:00 / 土日 10:00-16:00</p>
              <p>Email: info@docotan-detective.jp</p>
              <p>電話: 03-XXXX-XXXX（無料相談専用）</p>
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                お名前 *
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス *
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                件名 *
              </label>
              <select
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                <option value="briefing">無料説明会の予約</option>
                <option value="course">コースについて</option>
                <option value="certification">認定制度について</option>
                <option value="police">警察OBプログラム</option>
                <option value="corporate">法人研修</option>
                <option value="press">取材・メディア関係</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                メッセージ *
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ご相談内容、希望日時、オンライン/対面の希望などをご記入ください"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-600 text-white py-2 px-4 rounded-md hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '送信中...' : '送信'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}