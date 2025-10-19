import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { 
  createAnnouncement, 
  deleteAnnouncement, 
  deleteSunoPost, 
  getActiveAnnouncements, 
  getAllAnnouncements, 
  getAllUsers, 
  getSiteSetting, 
  getSunoPostById, 
  getUser, 
  setSiteSetting, 
  updateAnnouncement 
} from "../db";
import { sendEmail } from "../email";

// 管理者チェック用のミドルウェア
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "管理者権限が必要です",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // サイト設定取得
  getSettings: adminProcedure.query(async () => {
    const sitePassword = await getSiteSetting("site_password");
    const sunoActive = await getSiteSetting("suno_active");
    const manusActive = await getSiteSetting("manus_active");
    
    return {
      sitePassword: sitePassword?.value || process.env.SITE_PASSWORD || "",
      sunoActive: sunoActive?.value === "true",
      manusActive: manusActive?.value === "true",
    };
  }),

  // サイト設定更新
  updateSettings: adminProcedure
    .input(
      z.object({
        sitePassword: z.string().optional(),
        sunoActive: z.boolean().optional(),
        manusActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.sitePassword !== undefined) {
        await setSiteSetting("site_password", input.sitePassword);
      }
      if (input.sunoActive !== undefined) {
        await setSiteSetting("suno_active", input.sunoActive.toString());
      }
      if (input.manusActive !== undefined) {
        await setSiteSetting("manus_active", input.manusActive.toString());
      }
      
      return { success: true };
    }),

  // お知らせ一覧取得
  getAnnouncements: adminProcedure.query(async () => {
    return await getAllAnnouncements();
  }),

  // お知らせ作成
  createAnnouncement: adminProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input }) => {
      await createAnnouncement(input.content);
      return { success: true };
    }),

  // お知らせ更新
  updateAnnouncement: adminProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      await updateAnnouncement(input.id, input.content, input.isActive);
      return { success: true };
    }),

  // お知らせ削除
  deleteAnnouncement: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteAnnouncement(input.id);
      return { success: true };
    }),

  // ユーザー一覧取得
  getUsers: adminProcedure.query(async () => {
    return await getAllUsers();
  }),

  // ユーザーにメール送信
  sendUserEmail: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        subject: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUser(input.userId);
      
      if (!user || !user.email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ユーザーが見つかりません",
        });
      }

      await sendEmail({
        to: user.email,
        subject: input.subject,
        html: `<p>${input.content.replace(/\n/g, "<br>")}</p>`,
      });

      return { success: true };
    }),

  // Suno作品削除
  deleteSunoPost: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // 投稿情報を取得
      const post = await getSunoPostById(input.id);
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "投稿が見つかりません",
        });
      }

      // 投稿者情報を取得
      const user = await getUser(post.userId);
      
      // 投稿を削除
      await deleteSunoPost(input.id);

      // 投稿者にメール送信
      if (user && user.email) {
        await sendEmail({
          to: user.email,
          subject: "【SonchoのAIコミュニティー】投稿削除のお知らせ",
          html: `
            <p>${user.nickname || user.name || "ユーザー"}様</p>
            <p>あなたの投稿はサイトのポリシー違反が確認できたので、残念ですが削除させていただきました。</p>
            <p>ご不明な点がございましたら、お問い合わせください。</p>
            <p>SonchoのAIコミュニティー運営チーム</p>
          `,
        });
      }

      return { success: true };
    }),
});

