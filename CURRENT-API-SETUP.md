# 現在のAPI構成について

## 質問への回答

**Q: 今現在のManusチャット機能はOpenAIで動いているのではないということですか？**

**A: はい、その通りです。現在は**OpenAIではなく、Manus Forge API**を使用しています。**

---

## 📊 現在の構成

### 使用しているAPI

このアプリケーションは以下のAPIを使用しています：

| 機能 | 使用API | エンドポイント |
|------|---------|--------------|
| **チャット機能** | Manus Forge API | `https://forge.manus.im/v1/chat/completions` |
| **画像生成** | Manus Forge API | Forge経由 |
| **音声文字起こし** | Manus Forge API | Forge経由 |
| **データAPI** | Manus Forge API | Forge経由 |
| **通知** | Manus Forge API | Forge経由 |

### 環境変数

```bash
# 実際に使用されている環境変数
BUILT_IN_FORGE_API_URL=https://forge.manus.im  # Manus Forge APIのURL
BUILT_IN_FORGE_API_KEY=***                      # Manus Forge APIのキー

# 参考用（使用されていない可能性）
OPENAI_API_KEY=***                              # OpenAI APIキー
```

---

## 🔍 詳細説明

### Manus Forge APIとは

**Manus Forge API**は、Manusが提供する**内部API**です。以下の特徴があります：

1. **OpenAI互換**
   - OpenAI APIと同じエンドポイント形式
   - `/v1/chat/completions` など

2. **統合サービス**
   - チャット機能
   - 画像生成
   - 音声文字起こし
   - データ処理
   - 通知

3. **Manusエコシステム**
   - Manusのインフラ上で動作
   - Manusアカウントと連携

### コード内での使用方法

#### チャット機能（`server/_core/llm.ts`）

```typescript
// APIエンドポイントの解決
const resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

// APIキーの確認
const assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};

// APIリクエスト
const response = await fetch(resolveApiUrl(), {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${ENV.forgeApiKey}`,
  },
  body: JSON.stringify(payload),
});
```

**ポイント：**
- エラーメッセージには「OPENAI_API_KEY」と表示されますが、実際には`BUILT_IN_FORGE_API_KEY`を使用
- OpenAI互換のため、コードはOpenAI風に書かれている

---

## 🆚 Manus Forge API vs OpenAI API vs Manus Integrations API

### 比較表

| 項目 | Manus Forge API | OpenAI API | Manus Integrations API |
|------|-----------------|------------|------------------------|
| **現在の使用** | ✅ **使用中** | ❌ 未使用 | ❌ 未使用 |
| **提供元** | Manus | OpenAI | Manus |
| **エンドポイント** | `forge.manus.im` | `api.openai.com` | `api.manus.ai` |
| **互換性** | OpenAI互換 | OpenAI標準 | OpenAI互換 |
| **チャット機能** | ✅ | ✅ | ✅ |
| **画像生成** | ✅ | ✅ | ✅ |
| **音声処理** | ✅ | ✅ | ✅ |
| **エージェント機能** | ⚠️ 限定的 | ❌ | ✅ **強力** |
| **長時間タスク** | ⚠️ | ❌ | ✅ |
| **料金体系** | Manusクレジット | 従量課金 | Manusクレジット |

---

## 💡 なぜManus Forge APIを使っているのか

### 理由1：Manusエコシステムとの統合

このアプリはManusのプラットフォーム上で開発されているため、Manus Forge APIを使用することで：
- シームレスな統合
- 統一された認証
- 一元化された課金

### 理由2：OpenAI互換

Manus Forge APIはOpenAI互換なので：
- OpenAI用のコードがそのまま使える
- 将来的にOpenAIに切り替えも可能
- 開発者にとって馴染みやすい

### 理由3：追加機能

Manus Forge APIは以下の機能も提供：
- 画像生成
- 音声文字起こし
- データAPI
- 通知機能

---

## 🔄 取得したManus Integrations APIキーについて

### Manus Integrations APIとは

あなたが取得した`sk-qoe3pz-...`のキーは、**Manus Integrations API**用のキーです。

**Manus Integrations API**は：
- より高度なエージェント機能を提供
- 長時間タスクに対応
- 非同期処理が基本
- タスクベースのワークフロー

### 現在のアプリでの使用

**現時点では使用していません。** 理由：

1. **Manus Forge APIで十分**
   - 現在の機能要件を満たしている
   - 安定して動作している

2. **アーキテクチャの違い**
   - Forge API: リアルタイムチャット向け
   - Integrations API: 長時間タスク向け

3. **実装の複雑さ**
   - Integrations APIは非同期処理が必要
   - ポーリングやWebhookの実装が必要

---

## 🎯 今後の選択肢

### オプション1：現状維持（推奨）

**Manus Forge APIを継続使用**

**メリット：**
- ✅ 既に動作している
- ✅ 変更不要
- ✅ 安定性が高い
- ✅ シンプル

**デメリット：**
- ⚠️ 長時間タスクには不向き
- ⚠️ 高度なエージェント機能は限定的

**推奨ケース：**
- 現在の機能で満足
- 安定性を重視
- 追加開発を避けたい

### オプション2：Manus Integrations APIに切り替え

**取得したAPIキーを使用**

**メリット：**
- ✅ 高度なエージェント機能
- ✅ 長時間タスク対応
- ✅ より強力なAI機能

**デメリット：**
- ❌ コードの大幅な変更が必要
- ❌ 非同期処理の実装が必要
- ❌ 開発時間がかかる

**推奨ケース：**
- 複雑な分析タスクが必要
- 長時間の推論が必要
- 最新のAI機能を活用したい

### オプション3：OpenAI APIに切り替え

**OpenAI公式APIを使用**

**メリット：**
- ✅ 最も成熟したサービス
- ✅ 豊富なドキュメント
- ✅ 大きなコミュニティ

**デメリット：**
- ❌ Manusエコシステムから離れる
- ❌ 別途課金が必要
- ❌ 統合が複雑になる

**推奨ケース：**
- Manus外での運用を考えている
- OpenAIの特定機能が必要

### オプション4：ハイブリッド

**用途に応じて使い分け**

```typescript
// 簡単なチャット → Manus Forge API（現状）
// 複雑なタスク → Manus Integrations API（新規）
```

**メリット：**
- ✅ 各APIの強みを活用
- ✅ 柔軟性が高い

**デメリット：**
- ❌ 管理が複雑
- ❌ コストが増える可能性

---

## 📝 まとめ

### 現在の状況

1. **チャット機能はManus Forge APIで動作中**
   - OpenAIは使用していない
   - Manusのインフラを使用

2. **取得したAPIキーは別のAPI用**
   - Manus Integrations API用
   - より高度な機能を提供

3. **現状で問題なく動作**
   - 変更の必要性は低い
   - 安定している

### 推奨アクション

**現時点では変更不要です。**

理由：
- ✅ 既にManusのAPIを使用している
- ✅ 安定して動作している
- ✅ 機能要件を満たしている

**将来的に検討すべき場合：**
- 長時間の複雑なタスクが必要になった時
- より高度なAI機能が必要になった時
- パフォーマンスに問題が出た時

---

## ❓ よくある質問

**Q1: OpenAI APIキーは何のため？**

A: 環境変数に`OPENAI_API_KEY`が設定されている可能性がありますが、実際には使用されていません。`BUILT_IN_FORGE_API_KEY`が優先されます。

**Q2: 取得したManus Integrations APIキーは無駄？**

A: いいえ、将来的に高度な機能を追加する際に使用できます。保管しておいてください。

**Q3: コストはどうなっている？**

A: Manus Forge APIの使用料は、Manusアカウントのクレジットから消費されます。

**Q4: OpenAIに切り替えたい場合は？**

A: 可能ですが、以下の変更が必要です：
- 環境変数の変更
- コードの一部修正
- 画像生成・音声処理などの機能も別途実装

**Q5: Manus Integrations APIを試したい**

A: 可能です。別途実装が必要ですが、サポートできます。

---

## 🚀 次のステップ

### 推奨：現状維持

1. **何もしない**
   - 現在の構成で継続
   - Renderにデプロイ

2. **監視**
   - パフォーマンスを確認
   - コストを確認

3. **必要に応じて検討**
   - 問題が出たら再検討

### オプション：Manus Integrations APIを試す

もし試してみたい場合は、以下をサポートできます：

1. 非同期チャット機能の実装
2. タスクベースのワークフロー
3. 長時間タスクの処理

ご希望をお聞かせください！

