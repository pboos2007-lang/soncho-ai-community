import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { createManusAnswer, createManusQuestion, createSunoPost, getActiveAnnouncements, getManusAnswersByQuestionId, getManusQuestionById, getManusQuestions, getSunoPostById, getSunoPosts, getUserByEmail, getUserByVerificationToken, updateUserEmailVerified, upsertUser } from "../db";
import { sendVerificationEmail } from "../email";
import { publicProcedure, router } from "../_core/trpc";
import { sdk } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const customAuthRouter = router({
  // お知らせ取得
  getActiveAnnouncements: publicProcedure.query(async () => {
    return await getActiveAnnouncements();
  }),

  // サイトパスワード確認
  verifySitePassword: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(({ input }) => {
      const correctPassword = process.env.SITE_PASSWORD;
      if (!correctPassword) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "サイトパスワードが設定されていません",
        });
      }
      
      if (input.password !== correctPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "パスワードが正しくありません",
        });
      }
      
      return { success: true };
    }),

  // 会員登録
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        nickname: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // メールアドレスの重複チェック
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "このメールアドレスは既に登録されています",
        });
      }

      // パスワードをハッシュ化
      const passwordHash = await bcrypt.hash(input.password, 10);
      
      // 確認トークンを生成
      const verificationToken = randomBytes(32).toString("hex");
      
      // ユーザーIDを生成
      const userId = `user_${randomBytes(16).toString("hex")}`;
      
      // 管理者かどうかをチェック
      const adminEmail = process.env.ADMIN_EMAIL;
      const role = adminEmail && input.email === adminEmail ? "admin" : "user";

      // ユーザーを作成
      await upsertUser({
        id: userId,
        email: input.email,
        nickname: input.nickname,
        passwordHash,
        verificationToken,
        emailVerified: false,
        loginMethod: "email",
        role,
      });

      // 確認メールを送信
      const baseUrl = `${ctx.req.protocol}://${ctx.req.get("host")}`;
      await sendVerificationEmail(input.email, verificationToken, baseUrl);

      return { 
        success: true,
        message: "登録完了しました。確認メールをご確認ください。"
      };
    }),

  // メールアドレス確認
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const user = await getUserByVerificationToken(input.token);
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "無効な確認トークンです",
        });
      }

      await updateUserEmailVerified(user.id);

      return { 
        success: true,
        message: "メールアドレスが確認されました。ログインできます。"
      };
    }),

  // ログイン
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);
      
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "メールアドレスまたはパスワードが正しくありません",
        });
      }

      // メール確認チェック
      if (!user.emailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "メールアドレスが確認されていません。確認メールをご確認ください。",
        });
      }

      // パスワード確認
      const isValid = await bcrypt.compare(input.password, user.passwordHash);
      
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "メールアドレスまたはパスワードが正しくありません",
        });
      }

      // セッションを作成（既存の認証システムを利用）
      await upsertUser({
        id: user.id,
        lastSignedIn: new Date(),
      });

      // セッショントークンを作成してCookieに設定
      const sessionToken = await sdk.createSessionToken(user.id, {
        name: user.nickname || user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { 
        success: true,
        userId: user.id,
        message: "ログインしました"
      };
    }),
});

// Sunoルーター
export const sunoRouter = router({
  // 投稿作成
  createPost: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        youtubeUrl: z.string().url(),
        comment: z.string().min(1).max(300),
        category: z.enum(["Suno AI", "Suno Studio"]),
      })
    )
    .mutation(async ({ input }) => {
      await createSunoPost(input);
      return { success: true };
    }),

  // 投稿一覧取得
  getPosts: publicProcedure
    .input(z.object({ category: z.enum(["Suno AI", "Suno Studio"]).optional() }))
    .query(async ({ input }) => {
      return await getSunoPosts(input.category);
    }),

  // 投稿詳細取得
  getPost: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await getSunoPostById(input.id);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "投稿が見つかりません",
        });
      }
      return post;
    }),
});

// Manusルーター
export const manusRouter = router({
  // 質問作成
  createQuestion: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string().min(1).max(200),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      await createManusQuestion(input);
      return { success: true };
    }),

  // 質問一覧取得
  getQuestions: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input }) => {
      return await getManusQuestions(input.userId);
    }),

  // 質問詳細取得
  getQuestion: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const question = await getManusQuestionById(input.id);
      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "質問が見つかりません",
        });
      }
      return question;
    }),

  // 回答作成
  createAnswer: publicProcedure
    .input(
      z.object({
        questionId: z.number(),
        userId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      await createManusAnswer(input);
      return { success: true };
    }),

  // 回答一覧取得
  getAnswers: publicProcedure
    .input(z.object({ questionId: z.number() }))
    .query(async ({ input }) => {
      return await getManusAnswersByQuestionId(input.questionId);
    }),
});

