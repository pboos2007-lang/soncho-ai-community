import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const aiChatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `あなたはManusの使い方を教えるAIアシスタントです。
Manusは、AIエージェントプラットフォームで、以下のような機能があります：
- タスク管理とプロジェクト管理
- ファイル操作とコード編集
- ウェブブラウジングと情報検索
- データ分析と可視化
- AIによる自動化支援

ユーザーの質問に対して、親切で分かりやすく、具体的な回答を提供してください。
日本語で回答してください。`,
            },
            ...input.messages,
          ],
        });

        const assistantMessage = response.choices[0]?.message?.content || "申し訳ありません。応答を生成できませんでした。";

        return {
          role: "assistant" as const,
          content: assistantMessage,
        };
      } catch (error) {
        console.error("AI Chat Error:", error);
        throw new Error("AIチャットの処理中にエラーが発生しました");
      }
    }),
});

