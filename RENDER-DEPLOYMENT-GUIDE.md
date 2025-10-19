# Renderへのデプロイ完全ガイド

このガイドでは、「SonchoのAIコミュニティー」アプリケーションをRenderにデプロイする手順を詳しく説明します。

---

## 📋 目次

1. [事前準備](#step0)
2. [GitHubリポジトリの準備](#step1)
3. [PostgreSQLデータベースの作成](#step2)
4. [Webサービスの作成](#step3)
5. [環境変数の設定](#step4)
6. [デプロイの実行](#step5)
7. [動作確認](#step6)
8. [トラブルシューティング](#troubleshooting)

---

## <a name="step0"></a>ステップ0：事前準備

### 必要なもの

- ✅ Renderアカウント（作成済み）
- ✅ GitHubアカウント
- ✅ プロジェクトのソースコード
- ✅ 各種APIキー

### 確認事項

以下の情報を手元に用意してください：

1. **Manus関連**
   - `BUILT_IN_FORGE_API_URL`
   - `BUILT_IN_FORGE_API_KEY`
   - `OAUTH_SERVER_URL`
   - `OWNER_OPEN_ID`
   - `VITE_APP_ID`
   - `VITE_OAUTH_PORTAL_URL`

2. **メール送信（Resend）**
   - `RESEND_API_KEY`

3. **管理者情報**
   - `ADMIN_EMAIL`
   - `OWNER_NAME`

4. **セキュリティ**
   - `JWT_SECRET`（ランダムな文字列）
   - `SITE_PASSWORD`（サイトアクセス用パスワード）

---

## <a name="step1"></a>ステップ1：GitHubリポジトリの準備

### 1-1. GitHubリポジトリの作成

1. https://github.com にアクセス
2. 右上の「**+**」→「**New repository**」をクリック
3. リポジトリ情報を入力：
   - **Repository name**: `soncho-ai-community`
   - **Description**: `SonchoのAIコミュニティーアプリケーション`
   - **Visibility**: `Private`（推奨）または `Public`
4. 「**Create repository**」をクリック

### 1-2. ローカルコードをプッシュ

**重要：** 機密情報が含まれていないか確認してください。

```bash
# プロジェクトディレクトリに移動
cd /home/ubuntu/soncho-ai-community

# Gitの初期化（まだの場合）
git init

# .gitignoreの確認
cat .gitignore
# .env ファイルが含まれていることを確認

# すべてのファイルをステージング
git add .

# コミット
git commit -m "Initial commit for Render deployment"

# GitHubリポジトリをリモートとして追加
# （YOUR_USERNAMEを実際のGitHubユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/soncho-ai-community.git

# プッシュ
git branch -M main
git push -u origin main
```

**注意：**
- `.env` ファイルは**絶対にプッシュしない**でください
- `.gitignore` に `.env` が含まれていることを確認

### 1-3. GitHubでの確認

1. GitHubリポジトリページにアクセス
2. ファイルが正しくアップロードされているか確認
3. `.env` ファイルが**含まれていない**ことを確認

---

## <a name="step2"></a>ステップ2：PostgreSQLデータベースの作成

### 2-1. Renderダッシュボードにアクセス

1. https://dashboard.render.com にログイン
2. 左側メニューから「**PostgreSQL**」を選択
3. 「**+ New PostgreSQL**」ボタンをクリック

### 2-2. データベースの設定

以下の情報を入力：

| 項目 | 設定値 |
|------|--------|
| **Name** | `soncho-ai-community-db` |
| **Database** | `soncho_ai_community` |
| **User** | `soncho_admin`（自動生成でもOK） |
| **Region** | `Singapore (Southeast Asia)`（日本に近い） |
| **PostgreSQL Version** | `16`（最新版） |
| **Datadog API Key** | 空欄 |
| **Plan** | `Free`（無料プラン） |

### 2-3. データベースの作成

1. 「**Create Database**」ボタンをクリック
2. 作成には数分かかります
3. ステータスが「**Available**」になるまで待機

### 2-4. 接続情報の取得

データベースが作成されたら、接続情報を取得します：

1. データベースの詳細ページを開く
2. 「**Connections**」セクションを確認
3. 「**Internal Database URL**」をコピー

**形式例：**
```
postgresql://user:password@hostname/database
```

**重要：** この接続URLは後で使用するので、安全な場所に保存してください。

---

## <a name="step3"></a>ステップ3：Webサービスの作成

### 3-1. 新しいWebサービスの作成

1. Renderダッシュボードに戻る
2. 左側メニューから「**Web Services**」を選択
3. 「**+ New Web Service**」ボタンをクリック

### 3-2. GitHubリポジトリの接続

1. 「**Connect a repository**」セクションで「**GitHub**」を選択
2. 初回の場合、GitHubとの連携を許可
3. リポジトリ一覧から `soncho-ai-community` を選択
4. 「**Connect**」をクリック

### 3-3. サービスの設定

以下の情報を入力：

#### 基本設定

| 項目 | 設定値 |
|------|--------|
| **Name** | `soncho-ai-community` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `main` |
| **Root Directory** | 空欄 |
| **Runtime** | `Node` |

#### ビルド設定

| 項目 | 設定値 |
|------|--------|
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |

#### プラン選択

| 項目 | 設定値 |
|------|--------|
| **Instance Type** | `Free`（無料プラン） |

**無料プランの制限：**
- 750時間/月の稼働時間
- 非アクティブ時は自動スリープ（15分）
- スリープから復帰に30秒程度

### 3-4. 環境変数の設定（一部）

「**Advanced**」セクションを展開し、以下を設定：

**Node.jsバージョン：**
```
NODE_VERSION=22
```

**注意：** 他の環境変数は次のステップで設定します。

---

## <a name="step4"></a>ステップ4：環境変数の設定

### 4-1. 環境変数の追加

Webサービスの設定画面で「**Environment**」タブを選択し、以下の環境変数を追加します。

#### 必須環境変数

**1. データベース接続**
```
DATABASE_URL=<ステップ2-4で取得したInternal Database URL>
```

**2. Manus関連**
```
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=<Manus Forge APIキー>
OAUTH_SERVER_URL=<OAuth ServerのURL>
OWNER_OPEN_ID=<オーナーのOpen ID>
VITE_APP_ID=<アプリID>
VITE_OAUTH_PORTAL_URL=<OAuth PortalのURL>
```

**3. セキュリティ**
```
JWT_SECRET=<ランダムな長い文字列（32文字以上推奨）>
SITE_PASSWORD=<サイトアクセス用パスワード>
```

**4. メール送信（Resend）**
```
RESEND_API_KEY=<ResendのAPIキー>
```

**5. 管理者情報**
```
ADMIN_EMAIL=<管理者のメールアドレス>
OWNER_NAME=<オーナーの名前>
```

**6. アプリ設定**
```
VITE_APP_TITLE=SonchoのAIコミュニティー
VITE_APP_LOGO=<ロゴのURL（オプション）>
```

**7. その他**
```
NODE_ENV=production
SKIP_EMAIL_VERIFICATION=false
```

#### JWT_SECRETの生成方法

ランダムな文字列を生成します：

**方法1：オンラインツール**
- https://randomkeygen.com/
- 「Fort Knox Passwords」をコピー

**方法2：コマンドライン**
```bash
openssl rand -base64 32
```

### 4-2. 環境変数の確認

すべての環境変数を入力したら、以下を確認：

- [ ] `DATABASE_URL` が正しい
- [ ] すべてのManus関連の変数が設定されている
- [ ] `JWT_SECRET` が長くランダムな文字列
- [ ] `RESEND_API_KEY` が正しい
- [ ] `ADMIN_EMAIL` が正しい

---

## <a name="step5"></a>ステップ5：デプロイの実行

### 5-1. デプロイの開始

1. すべての設定を確認
2. 「**Create Web Service**」ボタンをクリック
3. 自動的にデプロイが開始されます

### 5-2. デプロイの進行状況

デプロイログが表示されます。以下の手順が実行されます：

1. **コードのクローン**
   ```
   Cloning repository...
   ```

2. **依存関係のインストール**
   ```
   Running: pnpm install
   ```

3. **ビルド**
   ```
   Running: pnpm build
   ```

4. **起動**
   ```
   Running: pnpm start
   Server running on port 3000
   ```

### 5-3. デプロイ時間

- 初回デプロイ：約5-10分
- 2回目以降：約3-5分（キャッシュ利用）

### 5-4. デプロイの完了

ステータスが「**Live**」になったら成功です！

---

## <a name="step6"></a>ステップ6：動作確認

### 6-1. アプリケーションのURL

デプロイが完了すると、以下のようなURLが発行されます：

```
https://soncho-ai-community.onrender.com
```

### 6-2. 初回アクセス

1. ブラウザで上記URLにアクセス
2. サイトパスワード入力画面が表示される
3. 設定した`SITE_PASSWORD`を入力
4. ログイン画面が表示される

### 6-3. ユーザー登録

1. 「新規登録」をクリック
2. メールアドレスとパスワードを入力
3. 登録
4. メール認証（`SKIP_EMAIL_VERIFICATION=false`の場合）
5. ログイン

### 6-4. 機能テスト

以下の機能が正常に動作するか確認：

- [ ] ログイン/ログアウト
- [ ] メニューページの表示
- [ ] Sunoエリアへのアクセス
- [ ] Manusエリアへのアクセス
- [ ] AIチャット機能
- [ ] 管理者画面（管理者の場合）

---

## <a name="troubleshooting"></a>トラブルシューティング

### エラー1：「Build failed」

**原因：**
- ビルドコマンドが間違っている
- 依存関係のインストールに失敗

**解決方法：**
1. ビルドログを確認
2. `package.json` の `build` スクリプトを確認
3. ビルドコマンドを修正：
   ```
   pnpm install && pnpm build
   ```

### エラー2：「Application failed to start」

**原因：**
- 起動コマンドが間違っている
- 環境変数が不足

**解決方法：**
1. 起動ログを確認
2. 起動コマンドを確認：
   ```
   pnpm start
   ```
3. 環境変数を確認

### エラー3：「Database connection failed」

**原因：**
- `DATABASE_URL` が間違っている
- データベースが起動していない

**解決方法：**
1. `DATABASE_URL` を再確認
2. **Internal Database URL**を使用しているか確認
3. データベースのステータスを確認

### エラー4：「Port already in use」

**原因：**
- ポート設定の問題

**解決方法：**
1. `server/_core/index.ts` を確認
2. `process.env.PORT` を使用しているか確認
3. Renderは自動的にポートを割り当てます

### エラー5：「502 Bad Gateway」

**原因：**
- アプリケーションが起動していない
- クラッシュしている

**解決方法：**
1. ログを確認
2. エラーメッセージを確認
3. 環境変数を再確認

### エラー6：「無料プランの制限」

**症状：**
- 非アクティブ時にスリープ
- 初回アクセスが遅い（30秒）

**解決方法：**
- 有料プラン（月$7〜）にアップグレード
- または、定期的にアクセスしてスリープを防ぐ

---

## 📊 デプロイ後の管理

### ログの確認

1. Renderダッシュボードでサービスを選択
2. 「**Logs**」タブを開く
3. リアルタイムログを確認

### 再デプロイ

**自動デプロイ：**
- GitHubの`main`ブランチにプッシュすると自動デプロイ

**手動デプロイ：**
1. Renderダッシュボードでサービスを選択
2. 「**Manual Deploy**」→「**Deploy latest commit**」

### 環境変数の変更

1. 「**Environment**」タブを開く
2. 変更したい変数を編集
3. 「**Save Changes**」
4. 自動的に再デプロイ

### データベースのバックアップ

無料プランではバックアップは含まれません。有料プラン（月$7〜）では自動バックアップが利用可能です。

---

## 💰 料金プラン

### 無料プラン

**Webサービス：**
- 750時間/月
- 非アクティブ時スリープ
- 512MB RAM
- 0.1 CPU

**PostgreSQL：**
- 1GB ストレージ
- 90日間有効
- バックアップなし

**合計：** 0円/月

### 有料プラン（推奨）

**Starter（月$7）：**
- Webサービス + PostgreSQL
- 常時起動
- 自動バックアップ
- 10GB ストレージ

**Standard（月$25）：**
- より高性能
- 高速レスポンス

---

## ✅ デプロイチェックリスト

### 事前準備
- [ ] Renderアカウント作成
- [ ] GitHubアカウント作成
- [ ] 各種APIキーの取得

### GitHubリポジトリ
- [ ] リポジトリ作成
- [ ] コードをプッシュ
- [ ] `.env`が含まれていないことを確認

### Render設定
- [ ] PostgreSQLデータベース作成
- [ ] Webサービス作成
- [ ] GitHubリポジトリ接続
- [ ] ビルドコマンド設定
- [ ] 起動コマンド設定
- [ ] 環境変数設定

### デプロイ
- [ ] デプロイ実行
- [ ] ログ確認
- [ ] ステータスが「Live」

### 動作確認
- [ ] URLにアクセス
- [ ] サイトパスワード入力
- [ ] ユーザー登録
- [ ] ログイン
- [ ] 各機能のテスト

---

## 🎯 次のステップ

デプロイが完了したら：

1. **独自ドメインの設定**（オプション）
   - Renderで独自ドメインを設定可能
   - SSL証明書は自動

2. **監視の設定**
   - アップタイム監視
   - エラーアラート

3. **パフォーマンスの最適化**
   - キャッシュの実装
   - 画像の最適化

4. **バックアップの設定**
   - 有料プランにアップグレード
   - 定期的なバックアップ

---

## 📚 参考リンク

- **Render公式ドキュメント：** https://render.com/docs
- **Renderダッシュボード：** https://dashboard.render.com
- **サポート：** https://render.com/support

---

## 💡 サポートが必要な場合

デプロイ中に問題が発生した場合は、以下の情報を提供してください：

1. エラーメッセージ
2. デプロイログ
3. 実行した手順
4. 期待される動作

一緒に問題を解決しましょう！

