import { eq, and, sql } from 'drizzle-orm';
import db from '../db.js';
import { chapters, scenes } from '../../db/schema.js';
import handleRequest from '../utils/handleRequest.js';

// Chapters handlers
export const chapterHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    return await db.select().from(chapters)
      .where(eq(chapters.bookId, bookId))
      .orderBy(chapters.position, chapters.createdAt);
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(chapters).where(eq(chapters.id, id)).limit(1);
    return result[0] || null;
  }),

  create: handleRequest(async ({ bookId, name, description, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const maxResult = await db
        .select({ max: sql`MAX(${chapters.position})` })
        .from(chapters)
        .where(eq(chapters.bookId, bookId));
      finalPosition = (maxResult[0]?.max ?? -1) + 1;
    }

    const result = await db.insert(chapters).values({
      bookId,
      name,
      description: description || null,
      position: finalPosition,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { name, description, position }) => {
    const updateData = {
      updatedAt: Date.now(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (position !== undefined) updateData.position = position;

    const result = await db.update(chapters)
      .set(updateData)
      .where(eq(chapters.id, id))
      .returning();
    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    await db.delete(chapters).where(eq(chapters.id, id));
    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, chapterIds) => {
    const updates = chapterIds.map((chapterId, index) =>
      db.update(chapters)
        .set({ position: index, updatedAt: Date.now() })
        .where(and(
          eq(chapters.id, chapterId),
          eq(chapters.bookId, bookId)
        ))
    );

    await Promise.all(updates);
    return { reordered: true };
  }),
};

// Scenes handlers
export const sceneHandlers = {
  getAllByChapter: handleRequest(async (chapterId) => {
    return await db.select().from(scenes)
      .where(eq(scenes.chapterId, chapterId))
      .orderBy(scenes.position, scenes.createdAt);
  }),

  getAllByBook: handleRequest(async (bookId) => {
    return await db.select().from(scenes)
      .where(eq(scenes.bookId, bookId))
      .orderBy(scenes.position, scenes.createdAt);
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(scenes).where(eq(scenes.id, id)).limit(1);
    return result[0] || null;
  }),

  create: handleRequest(async ({ chapterId, bookId, name, content, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const maxResult = await db
        .select({ max: sql`MAX(${scenes.position})` })
        .from(scenes)
        .where(eq(scenes.chapterId, chapterId));
      finalPosition = (maxResult[0]?.max ?? -1) + 1;
    }

    const result = await db.insert(scenes).values({
      chapterId,
      bookId,
      name,
      content: content || null,
      position: finalPosition,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { name, content, position, status }) => {
    const updateData = {
      updatedAt: Date.now(),
    };

    if (name !== undefined) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (position !== undefined) updateData.position = position;
    if (status !== undefined) updateData.status = status;

    const result = await db.update(scenes)
      .set(updateData)
      .where(eq(scenes.id, id))
      .returning();
    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    await db.delete(scenes).where(eq(scenes.id, id));
    return { deleted: true };
  }),

  reorder: handleRequest(async (chapterId, sceneIds) => {
    const updates = sceneIds.map((sceneId, index) =>
      db.update(scenes)
        .set({ position: index, updatedAt: Date.now() })
        .where(and(
          eq(scenes.id, sceneId),
          eq(scenes.chapterId, chapterId)
        ))
    );

    await Promise.all(updates);
    return { reordered: true };
  }),

  moveToChapter: handleRequest(async (sceneId, targetChapterId) => {
    // Get the scene to validate it exists and get current chapter
    const scene = await db.select().from(scenes).where(eq(scenes.id, sceneId)).limit(1);
    if (!scene[0]) {
      throw new Error('Scene not found');
    }

    const currentChapterId = scene[0].chapterId;

    // If moving to the same chapter, do nothing
    if (currentChapterId === targetChapterId) {
      return { moved: false, message: 'Scene already in target chapter' };
    }

    // Get the max position in the target chapter
    const maxResult = await db
      .select({ max: sql`MAX(${scenes.position})` })
      .from(scenes)
      .where(eq(scenes.chapterId, targetChapterId));
    const newPosition = (maxResult[0]?.max ?? -1) + 1;

    // Update the scene
    const result = await db.update(scenes)
      .set({
        chapterId: targetChapterId,
        position: newPosition,
        updatedAt: Date.now()
      })
      .where(eq(scenes.id, sceneId))
      .returning();

    return {
      moved: true,
      scene: result[0],
      oldChapterId: currentChapterId,
      newChapterId: targetChapterId
    };
  }),
};