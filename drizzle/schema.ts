import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
  // Additional fields for custom auth
  nickname: varchar("nickname", { length: 100 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  verificationToken: varchar("verificationToken", { length: 255 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Suno posts table
export const sunoPosts = mysqlTable("suno_posts", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  youtubeUrl: varchar("youtubeUrl", { length: 500 }).notNull(),
  comment: text("comment").notNull(),
  category: mysqlEnum("category", ["Suno AI", "Suno Studio"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SunoPost = typeof sunoPosts.$inferSelect;
export type InsertSunoPost = typeof sunoPosts.$inferInsert;

// Manus questions table
export const manusQuestions = mysqlTable("manus_questions", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManusQuestion = typeof manusQuestions.$inferSelect;
export type InsertManusQuestion = typeof manusQuestions.$inferInsert;

// Manus answers table
export const manusAnswers = mysqlTable("manus_answers", {
  id: int("id").primaryKey().autoincrement(),
  questionId: int("questionId").notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManusAnswer = typeof manusAnswers.$inferSelect;
export type InsertManusAnswer = typeof manusAnswers.$inferInsert;
