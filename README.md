# DOCOTAN探偵スクール

現役プロ・警察OBから学ぶ民間探偵の実践型ハイブリッド教育プラットフォーム

## 🎯 概要

DOCOTAN探偵スクールは、探偵業界への転身やスキルアップを目指す方向けのオンライン学習プラットフォームです。現役探偵・元警察官・法務専門家による実践的な指導で、基礎からプロまでの包括的な探偵教育を提供します。

## 🏆 特徴

- **オンライン×OJT**: 動画学習と現場実地で最短で"使える力"へ
- **現役講師陣**: 探偵・警察OB・法務の専門家が指導
- **認定バッジ**: 修了後はプロフィールに認定バッジを表示 (DCD-Basic/Pro)

## 📚 コース体系

### 基礎コース (99,000円)
- 探偵業法の理解
- 基本的な調査技術
- 聞き込み・尾行の基礎
- 個人情報保護法

### プロコース (198,000円) 
- 実地OJT研修
- 報告書作成技術
- 浮気調査・人探しの実務
- 案件管理手法

### オプション上級 (33,000円〜)
- ドローン活用技術
- AI画像解析ツール
- デジタルフォレンジック

### 特別プログラム
- 警察OB向け短期認定プログラム
- 継続教育・年次アップデート研修

## 🛠️ 技術スタック

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, MongoDB, Mongoose
- **Authentication**: NextAuth.js + Simple Auth
- **Deployment**: Vercel
- **Database**: MongoDB Atlas

## 🚀 セットアップ

### 環境変数
`.env.local`ファイルを作成し、以下を設定：

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:4000
```

### インストールと起動

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

サーバーは http://localhost:4000 で起動します。

### 管理者アカウント

- **Email**: tomura@hackjpn.com
- **Password**: hikarutomura
- **Role**: admin

## 📖 主要機能

### 一般機能
- コース一覧・詳細表示
- 講師プロフィール
- 認定制度の確認
- お問い合わせフォーム

### 会員機能
- 動画視聴 (YouTube埋め込み)
- 学習進捗管理
- コメント・議論

### 管理機能
- 講師管理 (CRUD)
- 動画管理 (CRUD) 
- 会員管理
- 分析ダッシュボード

## 📱 ページ構成

- `/` - トップページ
- `/videos` - コース一覧
- `/instructors` - 講師一覧
- `/certification` - 認定制度
- `/police` - 警察OB向けプログラム
- `/continuing-education` - 継続教育
- `/contact` - お問い合わせ
- `/admin` - 管理画面

## 🎨 デザイン

- **ロゴ**: DOCOTAN探偵スクール専用ロゴ
- **カラー**: 探偵をイメージした落ち着いたブルー系
- **アイコン**: 統一されたDOCOTANブランディング

## 📊 データ

- **講師**: 6名 (現役探偵・警察OB・法務専門家)
- **動画**: 10コース (基礎〜上級・特別プログラム)
- **認定**: DCD-Basic / DCD-Pro 2レベル

## 🔒 認証

- シンプル認証 + NextAuth.js
- ロールベース権限管理 (user/admin)
- セッション管理とJWT

## 🌐 デプロイ

Vercelでの本番環境デプロイに対応

```bash
npm run build
npm run start
```

---

**DOCOTAN探偵スクール** - 探偵の知識とスキルを、すべての人に。