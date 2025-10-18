# デプロイ手順

このドキュメントでは、「SonchoのAIコミュニティー」をManusプラットフォームからデプロイする手順を説明します。

## 前提条件

以下の環境変数が設定されていることを確認してください：

- `SITE_PASSWORD`: サイト共通パスワード
- `OPENAI_API_KEY`: OpenAI APIキー
- `RESEND_API_KEY`: Resend APIキー
- `ADMIN_EMAIL`: 管理者メールアドレス
- `DATABASE_URL`: PostgreSQLデータベース接続URL
- `JWT_SECRET`: JWT署名用シークレット

## Manusからのデプロイ

### ステップ1: プロジェクトの確認

1. Manusのプロジェクト画面で、プロジェクトが正常に動作していることを確認
2. 開発サーバーのURLにアクセスして、すべての機能が動作することを確認

### ステップ2: デプロイボタンをクリック

1. Manusのプロジェクト画面で「Publish」ボタンをクリック
2. デプロイ設定画面が表示されます

### ステップ3: デプロイ設定

1. **プロジェクト名**: `soncho-ai-community`（または任意の名前）
2. **環境変数**: すべての必要な環境変数が設定されていることを確認
3. **ビルドコマンド**: `pnpm build`（自動設定）
4. **開始コマンド**: `pnpm start`（自動設定）

### ステップ4: デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドとデプロイが自動的に実行されます
3. デプロイが完了すると、公開URLが表示されます

## データベースのセットアップ

デプロイ後、データベースのマイグレーションを実行する必要があります。

### オプション1: Manusのコンソールから実行

```bash
pnpm db:push
```

### オプション2: ローカルから実行

```bash
# 本番環境のDATABASE_URLを使用
DATABASE_URL="your_production_database_url" pnpm db:push
```

## 管理者アカウントの設定

1. デプロイ後、最初に管理者アカウントを作成します
2. `ADMIN_EMAIL`に設定したメールアドレスで会員登録
3. データベースで該当ユーザーの`role`を`admin`に変更

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## 環境変数の管理

### 本番環境での環境変数設定

Manusのプロジェクト設定画面で、以下の環境変数を設定してください：

```
SITE_PASSWORD=your_production_password
OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@example.com
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_jwt_secret_at_least_32_characters
VITE_APP_TITLE=SonchoのAIコミュニティー
VITE_APP_LOGO=https://example.com/logo.png
```

### セキュリティ上の注意

- `JWT_SECRET`は32文字以上のランダムな文字列を使用
- `SITE_PASSWORD`は推測されにくいパスワードを設定
- APIキーは絶対に公開しないでください

## トラブルシューティング

### デプロイが失敗する場合

1. ビルドログを確認して、エラーメッセージを確認
2. 環境変数が正しく設定されているか確認
3. データベース接続URLが正しいか確認

### データベース接続エラー

1. `DATABASE_URL`が正しいフォーマットか確認
2. データベースサーバーが起動しているか確認
3. ファイアウォール設定を確認

### メール送信エラー

1. `RESEND_API_KEY`が正しいか確認
2. Resendのアカウントが有効か確認
3. 送信元メールアドレスがResendで認証されているか確認

## アップデート手順

1. Manusでコードを修正
2. 変更をテスト
3. 「Publish」ボタンをクリックして再デプロイ
4. 必要に応じてデータベースマイグレーションを実行

## バックアップ

定期的にデータベースのバックアップを取得することを推奨します：

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## モニタリング

- アプリケーションのログを定期的に確認
- データベースのパフォーマンスを監視
- ユーザーからのフィードバックを収集

## サポート

問題が発生した場合は、Manusのサポートチームにお問い合わせください。

