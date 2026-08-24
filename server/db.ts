import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { codeSnippets, InsertCodeSnippet, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      const value = user[field] ?? null;
      values[field] = value;
      updateSet[field] = value;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listSnippets(userId: number, search?: string) {
  const db = await getDb();
  if (!db) return [];
  const query = search?.trim();
  const where = query
    ? and(
        eq(codeSnippets.userId, userId),
        or(
          like(codeSnippets.title, `%${query}%`),
          like(codeSnippets.language, `%${query}%`),
          like(codeSnippets.category, `%${query}%`),
          like(codeSnippets.tags, `%${query}%`),
          like(codeSnippets.notes, `%${query}%`),
          like(codeSnippets.code, `%${query}%`),
        ),
      )
    : eq(codeSnippets.userId, userId);
  return db.select().from(codeSnippets).where(where).orderBy(desc(codeSnippets.updatedAt));
}

export async function getSnippetById(userId: number, id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(codeSnippets)
    .where(and(eq(codeSnippets.id, id), eq(codeSnippets.userId, userId)))
    .limit(1);
  return result[0];
}

export async function insertSnippet(input: InsertCodeSnippet) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const now = Date.now();
  const values: InsertCodeSnippet = { ...input, createdAt: input.createdAt ?? now, updatedAt: input.updatedAt ?? now };
  const result = await db.insert(codeSnippets).values(values);
  return getSnippetById(values.userId, Number(result[0].insertId));
}

export async function updateSnippet(userId: number, id: number, input: Partial<InsertCodeSnippet>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(codeSnippets).set({ ...input, updatedAt: Date.now() }).where(and(eq(codeSnippets.id, id), eq(codeSnippets.userId, userId)));
  return getSnippetById(userId, id);
}

export async function deleteSnippet(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(codeSnippets).where(and(eq(codeSnippets.id, id), eq(codeSnippets.userId, userId)));
  return { success: true } as const;
}
