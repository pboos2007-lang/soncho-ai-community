import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../drizzle/schema";

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("[Migration] DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log("[Migration] Starting database migration...");
    
    // Create tables using raw SQL to handle IF NOT EXISTS properly
    await pool.query(`
      -- Create role enum if not exists
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Create category enum if not exists
      DO $$ BEGIN
        CREATE TYPE category AS ENUM ('Suno AI', 'Suno Studio');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name TEXT,
        email VARCHAR(320),
        "loginMethod" VARCHAR(64),
        role role DEFAULT 'user' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "lastSignedIn" TIMESTAMP DEFAULT NOW(),
        nickname VARCHAR(100),
        "passwordHash" VARCHAR(255),
        "emailVerified" BOOLEAN DEFAULT false NOT NULL,
        "verificationToken" VARCHAR(255)
      );

      -- Create suno_posts table
      CREATE TABLE IF NOT EXISTS suno_posts (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "userId" VARCHAR(64) NOT NULL,
        "youtubeUrl" VARCHAR(500) NOT NULL,
        comment TEXT NOT NULL,
        category category NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create manus_questions table
      CREATE TABLE IF NOT EXISTS manus_questions (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "userId" VARCHAR(64) NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create manus_answers table
      CREATE TABLE IF NOT EXISTS manus_answers (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "questionId" INTEGER NOT NULL,
        "userId" VARCHAR(64) NOT NULL,
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create site_settings table
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create announcements table
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        content TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log("[Migration] Database migration completed successfully");
  } catch (error) {
    console.error("[Migration] Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

