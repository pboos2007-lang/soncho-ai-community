# SonchoのAIコミュニティー（Manus＆Suno）

音楽とAIをテーマにした温かみのあるコミュニティWebアプリケーションです。

## 主な機能

### 認証システム
- **共通パスワード保護**: サイトへのアクセスを環境変数で管理された共通パスワードで保護
- **会員登録**: メールアドレス、パスワード、ニックネームで登録
- **メール認証**: 登録時に確認メールを送信
- **ログイン**: メールアドレスとパスワードでログイン

### Sunoエリア
- **作品投稿**: YouTube URLとコメント（300文字まで）を投稿
- **カテゴリ選択**: Suno AI / Suno Studio
- **作品一覧**: カテゴリでフィルター可能、YouTube埋め込みプレイヤー表示
- **作品詳細**: YouTube動画、コメント全文、投稿者情報を表示

### Manusエリア
- **AIチャットボット**: OpenAI APIを使用したリアルタイムチャット
  - Manusの使い方に関する基本的な質問に自動応答
- **Sonchoに質問**: 質問投稿フォーム（タイトル、本文）
  - 質問一覧（自分の質問のみ表示）
  - 質問詳細ページ（Sonchoからの回答表示）

### 管理者機能
- **全質問一覧**: すべてのユーザーの質問を確認
- **回答投稿**: 質問に対して回答を投稿

### マイページ
- ユーザー情報表示
- 投稿統計（Suno投稿数、質問数）
- 自分のSuno投稿一覧
- 自分の質問一覧

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **バックエンド**: Node.js + Express + tRPC 11
- **データベース**: PostgreSQL + Drizzle ORM
- **認証**: bcrypt + JWT
- **メール送信**: Resend
- **AI**: OpenAI API

## 環境変数

以下の環境変数を設定してください：

```
# サイト共通パスワード
SITE_PASSWORD=your_site_password

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Resend API（メール送信）
RESEND_API_KEY=your_resend_api_key

# 管理者メールアドレス
ADMIN_EMAIL=admin@example.com

# データベース
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret

# OAuth（Manus）
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# アプリ情報
VITE_APP_TITLE=SonchoのAIコミュニティー
VITE_APP_LOGO=https://example.com/logo.png
```

## セットアップ

1. 依存関係をインストール:
```bash
pnpm install
```

2. データベースマイグレーション:
```bash
pnpm db:push
```

3. 開発サーバーを起動:
```bash
pnpm dev
```

4. ブラウザで http://localhost:3000 にアクセス

## 使い方

### 初回アクセス
1. トップページで共通パスワードを入力
2. 会員登録ページでアカウントを作成
3. メールに届いた確認リンクをクリック
4. ログインしてメインメニューへ

### Suno作品を投稿
1. メインメニューから「Sunoエリア」を選択
2. 「作品を投稿」ボタンをクリック
3. カテゴリ、YouTube URL、コメントを入力
4. 「投稿する」ボタンをクリック

### AIチャットボットを使う
1. メインメニューから「Manusエリア」を選択
2. 「AIチャットボット」を選択
3. Manusについて質問を入力

### Sonchoに質問する
1. メインメニューから「Manusエリア」を選択
2. 「Sonchoに質問」を選択
3. 「質問する」ボタンをクリック
4. タイトルと本文を入力して投稿

### 管理者として回答する
1. 管理者アカウントでログイン
2. メインメニューから「管理者」を選択
3. 質問を選択して回答を投稿

## デザイン

- **配色**: 青系（#0ea5e9）＋オレンジ系（#f97316）
- **テーマ**: 温かみのある親しみやすいデザイン
- **レスポンシブ**: スマホ、タブレット、デスクトップに対応

## ライセンス

MIT License

