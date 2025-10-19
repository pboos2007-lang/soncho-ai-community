# ManusAI APIキーの取得方法

このガイドでは、ManusAI APIキーを取得して、アプリケーションのチャット機能に統合する手順を説明します。

---

## 📋 目次

1. [ManusAIアカウントの確認](#step1)
2. [APIキーの取得](#step2)
3. [環境変数の設定](#step3)
4. [コードの変更](#step4)
5. [動作確認](#step5)

---

## <a name="step1"></a>ステップ1：ManusAIアカウントの確認

### 1-1. ManusAIにログイン

1. ブラウザで https://manus.im にアクセス
2. 右上の「**Sign in**」ボタンをクリック
3. アカウント情報でログイン

**既にアカウントをお持ちの場合：**
- そのままログインしてください

**アカウントがない場合：**
1. 「**Sign up**」をクリック
2. メールアドレスとパスワードを入力
3. アカウントを作成

---

## <a name="step2"></a>ステップ2：APIキーの取得

### 2-1. 設定ページにアクセス

ログイン後、以下の方法でAPI設定ページにアクセスします：

**方法1：直接アクセス**
1. ブラウザで以下のURLにアクセス：
   ```
   https://manus.im/settings/api
   ```

**方法2：メニューから移動**
1. 画面左下のプロフィールアイコンをクリック
2. 「**Settings**」（設定）を選択
3. 左側メニューから「**API Integration**」を選択

### 2-2. APIキーを生成

1. 「**API Integration**」ページで「**Generate API Key**」ボタンをクリック
2. 新しいAPIキーが表示されます
3. **重要：このキーは一度しか表示されません！**
4. 「**Copy**」ボタンをクリックしてコピー
5. 安全な場所に保存してください

**APIキーの形式例：**
```
manus_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2-3. APIキーの管理

- **セキュリティ：** APIキーは絶対に公開しないでください
- **複数のキー：** 必要に応じて複数のキーを作成できます
- **削除：** 不要になったキーは削除できます
- **再生成：** キーが漏洩した場合は削除して新しいキーを生成

---

## <a name="step3"></a>ステップ3：環境変数の設定

### 3-1. .envファイルを編集

プロジェクトのルートディレクトリにある `.env` ファイルを開きます。

**現在の設定：**
```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-...
```

**ManusAI APIキーを追加：**
```bash
# OpenAI API（既存）
OPENAI_API_KEY=sk-proj-...

# ManusAI API（新規追加）
MANUS_API_KEY=manus_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意：**
- `manus_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` の部分を、ステップ2でコピーした実際のAPIキーに置き換えてください
- OpenAI APIキーはそのまま残しておいてください（切り替えテスト用）

### 3-2. .envファイルの保存

ファイルを保存して閉じます。

---

## <a name="step4"></a>ステップ4：コードの変更

### 4-1. OpenAIクライアントファイルを編集

`server/lib/openai.ts` ファイルを開きます。

**現在のコード：**
```typescript
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### 4-2. ManusAI APIに切り替え

**オプションA：完全にManusAIに切り替え**

```typescript
import OpenAI from "openai";

export const openai = new OpenAI({
  baseURL: "https://api.manus.ai/v1",
  apiKey: "placeholder",  // プレースホルダー
  defaultHeaders: {
    "API_KEY": process.env.MANUS_API_KEY || "",
  },
});
```

**オプションB：両方使えるようにする（推奨）**

```typescript
import OpenAI from "openai";

// OpenAI（既存）
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ManusAI（新規）
export const manusAI = new OpenAI({
  baseURL: "https://api.manus.ai/v1",
  apiKey: "placeholder",
  defaultHeaders: {
    "API_KEY": process.env.MANUS_API_KEY || "",
  },
});

// デフォルトはManusAIを使用（切り替え可能）
export const chatAI = manusAI;  // または openai
```

### 4-3. 環境変数で切り替え可能にする（最も柔軟）

```typescript
import OpenAI from "openai";

const useManusAI = process.env.USE_MANUS_AI === "true";

export const openai = useManusAI
  ? new OpenAI({
      baseURL: "https://api.manus.ai/v1",
      apiKey: "placeholder",
      defaultHeaders: {
        "API_KEY": process.env.MANUS_API_KEY || "",
      },
    })
  : new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
```

**.envに追加：**
```bash
# AI Provider切り替え
USE_MANUS_AI=true  # trueでManusAI、falseでOpenAI
```

---

## <a name="step5"></a>ステップ5：動作確認

### 5-1. 開発サーバーを再起動

環境変数を読み込むため、サーバーを再起動します。

**ターミナルで実行：**
```bash
# 現在のサーバーを停止（Ctrl+C）
# 再起動
cd /home/ubuntu/soncho-ai-community
pnpm run dev
```

### 5-2. チャット機能をテスト

1. ブラウザでアプリにアクセス
2. ログイン
3. Manusエリアに移動
4. AIチャットボットに質問を送信
5. 正常に応答が返ってくることを確認

### 5-3. エラーチェック

**エラーが発生した場合：**

1. **APIキーの確認**
   - `.env` ファイルのAPIキーが正しいか確認
   - コピー時にスペースが入っていないか確認

2. **環境変数の読み込み**
   - サーバーを再起動したか確認
   - `console.log(process.env.MANUS_API_KEY)` でキーが読み込まれているか確認

3. **コードの確認**
   - `baseURL` が `https://api.manus.ai/v1` になっているか
   - `defaultHeaders` の `API_KEY` が正しく設定されているか

4. **ネットワークエラー**
   - インターネット接続を確認
   - ファイアウォールの設定を確認

---

## 📊 OpenAI vs ManusAI 比較テスト

両方のAPIを使えるようにした場合、以下の方法で比較できます：

### テスト1：応答速度

同じ質問を両方のAPIに送信して、応答時間を比較します。

### テスト2：応答品質

複雑な質問を送信して、回答の質を比較します。

### テスト3：コスト

使用量を記録して、コストを比較します。

### テスト4：エラー率

一定期間使用して、エラーの発生頻度を比較します。

---

## 🔒 セキュリティのベストプラクティス

### 1. APIキーの保護

- ✅ `.env` ファイルに保存
- ✅ `.gitignore` に `.env` を追加（既に設定済み）
- ❌ コードに直接書かない
- ❌ GitHubにプッシュしない
- ❌ 公開しない

### 2. APIキーのローテーション

- 定期的に新しいキーを生成
- 古いキーを削除
- 特にキーが漏洩した場合は即座に削除

### 3. 権限の最小化

- 必要な権限のみを持つキーを使用
- 不要なキーは削除

---

## 💰 料金について

### ManusAI API料金

ManusAI APIはクレジット制です。詳細な料金は以下で確認できます：

1. https://manus.im/settings/billing にアクセス
2. 「**Pricing**」または「**Usage**」を確認

**一般的な料金体系：**
- タスクごとにクレジット消費
- 複雑なタスクほど多くのクレジット消費
- 無料クレジットが付与される場合あり

### コスト管理

1. **使用量の監視**
   - ダッシュボードで使用量を確認
   - アラートを設定

2. **予算の設定**
   - 月額予算を設定
   - 超過時の通知を有効化

3. **最適化**
   - 不要なリクエストを削減
   - キャッシュを活用

---

## 🆘 トラブルシューティング

### エラー1：「Invalid API Key」

**原因：**
- APIキーが間違っている
- APIキーが無効化されている

**解決方法：**
1. `.env` ファイルのAPIキーを確認
2. ManusAIダッシュボードでキーが有効か確認
3. 必要に応じて新しいキーを生成

### エラー2：「Rate Limit Exceeded」

**原因：**
- リクエスト数が制限を超えた

**解決方法：**
1. リクエスト頻度を下げる
2. 有料プランにアップグレード
3. キャッシュを実装

### エラー3：「Network Error」

**原因：**
- インターネット接続の問題
- APIサーバーのダウン

**解決方法：**
1. インターネット接続を確認
2. ManusAIのステータスページを確認
3. しばらく待ってから再試行

---

## 📚 参考リンク

- **ManusAI公式サイト：** https://manus.im
- **API ドキュメント：** https://open.manus.ai/docs
- **ダッシュボード：** https://manus.im/settings
- **サポート：** https://help.manus.im

---

## ✅ チェックリスト

設定が完了したら、以下を確認してください：

- [ ] ManusAIアカウントにログインできる
- [ ] APIキーを取得した
- [ ] APIキーを安全に保存した
- [ ] `.env` ファイルに `MANUS_API_KEY` を追加した
- [ ] コードを変更した（`server/lib/openai.ts`）
- [ ] 開発サーバーを再起動した
- [ ] チャット機能が動作することを確認した
- [ ] エラーがないことを確認した

---

## 🎯 次のステップ

APIキーの設定が完了したら：

1. **テスト環境で動作確認**
   - 様々な質問を試す
   - エラーハンドリングを確認

2. **性能比較**
   - OpenAI vs ManusAI
   - 応答速度、品質、コストを比較

3. **本番環境へのデプロイ**
   - Renderにデプロイ
   - 環境変数を設定

4. **監視とメンテナンス**
   - 使用量を監視
   - エラーログを確認

---

## 💡 サポートが必要な場合

以下の情報を提供してください：

1. エラーメッセージ（あれば）
2. 実行した手順
3. 期待される動作
4. 実際の動作

一緒に問題を解決しましょう！

