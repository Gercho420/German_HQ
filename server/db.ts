import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  ContactMessage,
  contactMessages,
  GalleryPhoto,
  galleryPhotos,
  InsertContactMessage,
  InsertGalleryPhoto,
  InsertReview,
  InsertUser,
  Review,
  reviews,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Gallery Photos =====

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.sortOrder), desc(galleryPhotos.createdAt));
  return result;
}

export async function createGalleryPhoto(data: InsertGalleryPhoto): Promise<GalleryPhoto> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(galleryPhotos).values(data);
  const [row] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, result[0].insertId)).limit(1);
  return row;
}

export async function deleteGalleryPhoto(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
}

export async function updateGalleryPhoto(id: number, data: Partial<InsertGalleryPhoto>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryPhotos).set(data).where(eq(galleryPhotos.id, id));
}

// ===== Reviews =====

export async function getApprovedReviews(): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(reviews).where(eq(reviews.approved, "approved")).orderBy(desc(reviews.createdAt));
  return result;
}

export async function getAllReviews(): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  return result;
}

export async function createReview(data: InsertReview): Promise<Review> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviews).values(data);
  const [row] = await db.select().from(reviews).where(eq(reviews.id, result[0].insertId)).limit(1);
  return row;
}

export async function updateReviewStatus(id: number, approved: "pending" | "approved" | "rejected"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ approved }).where(eq(reviews.id, id));
}

export async function deleteReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(reviews).where(eq(reviews.id, id));
}

// ===== Contact Messages =====

export async function createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contactMessages).values(data);
  const [row] = await db.select().from(contactMessages).where(eq(contactMessages.id, result[0].insertId)).limit(1);
  return row;
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return result;
}

export async function markContactMessageRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactMessages).set({ read: "read" }).where(eq(contactMessages.id, id));
}

export async function deleteContactMessage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}
