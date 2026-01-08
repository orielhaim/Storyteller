import { eq, desc } from 'drizzle-orm';
import db from '../db.js';
import { books } from '../../db/schema.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';

// Books handlers
export const bookHandlers = {
  getAll: handleRequest(async () => {
    return await db.select().from(books).orderBy(desc(books.createdAt));
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
    return result[0] || null;
  }),

  create: handleRequest(async ({ name, author, description, image, progressStatus, genres, targetAudience, primaryLanguage }) => {
    const now = Date.now();
    const result = await db.insert(books).values({
      name,
      author,
      description: description || null,
      image: image || null,
      progressStatus: progressStatus || "not_started",
      genres: genres || [],
      targetAudience: targetAudience || "general",
      primaryLanguage: primaryLanguage || "en",
      createdAt: now,
      updatedAt: now,
      archived: false,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { name, author, description, image, progressStatus, genres, targetAudience, primaryLanguage }) => {
    const result = await db.update(books)
      .set({
        name,
        author,
        description: description || null,
        image: image || null,
        progressStatus: progressStatus || undefined,
        genres: genres || undefined,
        targetAudience: targetAudience || undefined,
        primaryLanguage: primaryLanguage || undefined,
        updatedAt: Date.now(),
      })
      .where(eq(books.id, id))
      .returning();
    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    // Get book to check for image
    const book = await db.select({ image: books.image }).from(books).where(eq(books.id, id)).limit(1);
    if (book[0]?.image) {
      await imageHandlers.deleteImage(null, book[0].image);
    }

    await db.delete(books).where(eq(books.id, id));
    return { deleted: true };
  }),

  archive: handleRequest(async (id) => {
    const result = await db.update(books)
      .set({ archived: true, updatedAt: Date.now() })
      .where(eq(books.id, id))
      .returning();
    return result[0] || null;
  }),

  unarchive: handleRequest(async (id) => {
    const result = await db.update(books)
      .set({ archived: false, updatedAt: Date.now() })
      .where(eq(books.id, id))
      .returning();
    return result[0] || null;
  }),
};