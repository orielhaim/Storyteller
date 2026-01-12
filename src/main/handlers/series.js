import { eq, desc, and, sql } from 'drizzle-orm';
import db from '../db.js';
import { books, series, bookSeries } from '../../db/schema.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';

// Series handlers
export const seriesHandlers = {
  getAll: handleRequest(async () => {
    return await db.select().from(series).orderBy(desc(series.createdAt));
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(series).where(eq(series.id, id)).limit(1);
    return result[0] || null;
  }),

  getBooks: handleRequest(async (seriesId) => {
    const result = await db
      .select({
        id: books.id,
        name: books.name,
        author: books.author,
        description: books.description,
        image: books.image,
        progressStatus: books.progressStatus,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        archived: books.archived,
        position: bookSeries.position,
      })
      .from(bookSeries)
      .innerJoin(books, eq(bookSeries.bookId, books.id))
      .where(eq(bookSeries.seriesId, seriesId))
      .orderBy(bookSeries.position);
    return result;
  }),

  create: handleRequest(async ({ name, description, image }) => {
    const now = Date.now();
    const result = await db.insert(series).values({
      name,
      description: description || null,
      image: image || null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { name, description, image }) => {
    const result = await db.update(series)
      .set({
        name,
        description: description || null,
        image: image || null,
        updatedAt: Date.now(),
      })
      .where(eq(series.id, id))
      .returning();
    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    // Get series to check for image
    const seriesItem = await db.select({ image: series.image }).from(series).where(eq(series.id, id)).limit(1);
    if (seriesItem[0]?.image) {
      await imageHandlers.deleteImage(null, seriesItem[0].image);
    }

    await db.delete(series).where(eq(series.id, id));
    return { deleted: true };
  }),

  archive: handleRequest(async (id) => {
    const result = await db.update(series)
      .set({ archived: true, updatedAt: Date.now() })
      .where(eq(series.id, id))
      .returning();
    return result[0] || null;
  }),

  unarchive: handleRequest(async (id) => {
    const result = await db.update(series)
      .set({ archived: false, updatedAt: Date.now() })
      .where(eq(series.id, id))
      .returning();
    return result[0] || null;
  }),
};

// Book-Series relationship handlers
export const bookSeriesHandlers = {
  addBookToSeries: handleRequest(async (bookId, seriesId, position = null) => {
    // If position not provided, get max position and add 1
    if (position === null) {
      const maxResult = await db
        .select({ max: sql`MAX(${bookSeries.position})` })
        .from(bookSeries)
        .where(eq(bookSeries.seriesId, seriesId));
      position = (maxResult[0]?.max ?? -1) + 1;
    }

    const result = await db.insert(bookSeries).values({
      bookId,
      seriesId,
      position,
    }).returning();
    return result[0];
  }),

  removeBookFromSeries: handleRequest(async (bookId, seriesId) => {
    await db.delete(bookSeries)
      .where(and(
        eq(bookSeries.bookId, bookId),
        eq(bookSeries.seriesId, seriesId)
      ));
    return { removed: true };
  }),

  updateBookPosition: handleRequest(async (bookId, seriesId, newPosition) => {
    const result = await db.update(bookSeries)
      .set({ position: newPosition })
      .where(and(
        eq(bookSeries.bookId, bookId),
        eq(bookSeries.seriesId, seriesId)
      ))
      .returning();
    return result[0] || null;
  }),

  reorderSeries: handleRequest(async (seriesId, bookIds) => {
    // Update positions for all books in the series atomically
    const updates = bookIds.map((bookId, index) =>
      db.update(bookSeries)
        .set({ position: index })
        .where(and(
          eq(bookSeries.bookId, bookId),
          eq(bookSeries.seriesId, seriesId)
        ))
    );

    await Promise.all(updates);
    return { reordered: true };
  }),
};