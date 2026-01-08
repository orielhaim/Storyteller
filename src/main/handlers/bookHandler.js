import { eq, and, desc, sql } from 'drizzle-orm';
import db from '../db.js';
import { books, series, bookSeries, characters } from '../../db/schema.js';
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

// Characters handlers
export const characterHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    return await db.select().from(characters).where(eq(characters.bookId, bookId)).orderBy(desc(characters.createdAt));
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
    return result[0] || null;
  }),

  create: handleRequest(async ({ bookId, first_name, last_name, role, avatar, description, attributes, groups, tags }) => {
    const now = Date.now();
    const result = await db.insert(characters).values({
      bookId,
      firstName: first_name,
      lastName: last_name || '',
      role: role || "supporting",
      avatar: avatar || null,
      description: description || null,
      attributes: attributes || {},
      groups: groups || [],
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { first_name, last_name, role, avatar, description, attributes, groups, tags }) => {
    const updateData = {
      updatedAt: Date.now(),
    };

    // Only include fields that were explicitly provided
    if (first_name !== undefined) updateData.firstName = first_name;
    if (last_name !== undefined) updateData.lastName = last_name;
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (description !== undefined) updateData.description = description;
    if (attributes !== undefined) updateData.attributes = attributes;
    if (groups !== undefined) updateData.groups = groups;
    if (tags !== undefined) updateData.tags = tags;

    const result = await db.update(characters)
      .set(updateData)
      .where(eq(characters.id, id))
      .returning();
    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    // Get character to check for avatar
    const character = await db.select({ avatar: characters.avatar }).from(characters).where(eq(characters.id, id)).limit(1);
    if (character[0]?.avatar) {
      await imageHandlers.deleteImage(null, character[0].avatar);
    }

    await db.delete(characters).where(eq(characters.id, id));
    return { deleted: true };
  }),
};