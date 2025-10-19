import { boolean, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
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
export const categoryEnum = pgEnum("category", ["Suno AI", "Suno Studio"]);

export const sunoPosts = pgTable("suno_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("userId", { length: 64 }).notNull(),
  youtubeUrl: varchar("youtubeUrl", { length: 500 }).notNull(),
  comment: text("comment").notNull(),
  category: categoryEnum("category").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SunoPost = typeof sunoPosts.$inferSelect;
export type InsertSunoPost = typeof sunoPosts.$inferInsert;

// Manus questions table
export const manusQuestions = pgTable("manus_questions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("userId", { length: 64 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManusQuestion = typeof manusQuestions.$inferSelect;
export type InsertManusQuestion = typeof manusQuestions.$inferInsert;

// Manus answers table
export const manusAnswers = pgTable("manus_answers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer("questionId").notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManusAnswer = typeof manusAnswers.$inferSelect;
export type InsertManusAnswer = typeof manusAnswers.$inferInsert;

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// Announcements table
export const announcements = pgTable("announcements", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  content: text("content").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

