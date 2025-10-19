import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertManusAnswer, InsertManusQuestion, InsertSunoPost, InsertUser, manusAnswers, manusQuestions, sunoPosts, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "nickname", "passwordHash", "verificationToken"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Handle boolean field
    if (user.emailVerified !== undefined) {
      values.emailVerified = user.emailVerified;
      updateSet.emailVerified = user.emailVerified;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Suno Posts queries
export async function createSunoPost(post: InsertSunoPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sunoPosts).values(post);
  return result;
}

export async function getSunoPosts(category?: "Suno AI" | "Suno Studio") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (category) {
    return await db.select().from(sunoPosts).where(eq(sunoPosts.category, category)).orderBy(desc(sunoPosts.createdAt));
  }
  return await db.select().from(sunoPosts).orderBy(desc(sunoPosts.createdAt));
}

export async function getSunoPostById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(sunoPosts).where(eq(sunoPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Manus Questions queries
export async function createManusQuestion(question: InsertManusQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(manusQuestions).values(question);
  return result;
}

export async function getManusQuestions(userId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (userId) {
    return await db.select().from(manusQuestions).where(eq(manusQuestions.userId, userId)).orderBy(desc(manusQuestions.createdAt));
  }
  return await db.select().from(manusQuestions).orderBy(desc(manusQuestions.createdAt));
}

export async function getManusQuestionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(manusQuestions).where(eq(manusQuestions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Manus Answers queries
export async function createManusAnswer(answer: InsertManusAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(manusAnswers).values(answer);
  return result;
}

export async function getManusAnswersByQuestionId(questionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(manusAnswers).where(eq(manusAnswers.questionId, questionId)).orderBy(desc(manusAnswers.createdAt));
}

// User queries for custom auth
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByVerificationToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserEmailVerified(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ emailVerified: true, verificationToken: null }).where(eq(users.id, userId));
}


// Site settings functions
export async function getSiteSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const { siteSettings } = await import("../drizzle/schema");
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSiteSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  
  const { siteSettings } = await import("../drizzle/schema");
  await db.insert(siteSettings).values({ key, value, updatedAt: new Date() })
    .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
}

// Announcement functions
export async function getActiveAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  
  const { announcements } = await import("../drizzle/schema");
  return await db.select().from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(desc(announcements.createdAt));
}

export async function getAllAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  
  const { announcements } = await import("../drizzle/schema");
  return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function createAnnouncement(content: string) {
  const db = await getDb();
  if (!db) return;
  
  const { announcements } = await import("../drizzle/schema");
  await db.insert(announcements).values({ content, isActive: true, createdAt: new Date(), updatedAt: new Date() });
}

export async function updateAnnouncement(id: number, content: string, isActive: boolean) {
  const db = await getDb();
  if (!db) return;
  
  const { announcements } = await import("../drizzle/schema");
  await db.update(announcements)
    .set({ content, isActive, updatedAt: new Date() })
    .where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) return;
  
  const { announcements } = await import("../drizzle/schema");
  await db.delete(announcements).where(eq(announcements.id, id));
}

// User management functions
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function deleteSunoPost(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(sunoPosts).where(eq(sunoPosts.id, id));
}

