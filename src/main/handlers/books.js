import { eq, desc, sql } from 'drizzle-orm';
import db from '../db.js';
import { books, chapters, scenes, characters, worlds, locations, objects } from '../../db/schema.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';

function extractTextFromNode(node) {
  if (!node) return '';
  let text = '';
  if (typeof node.text === 'string') {
    text += node.text + ' ';
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractTextFromNode(child);
    }
  }
  return text;
}

function countWordsFromContent(rawContent) {
  if (!rawContent) return 0;
  let value = rawContent;
  try {
    if (typeof value === 'string') {
      if (value === 'null' || value.trim() === '') {
        return 0;
      }
      value = JSON.parse(value);
    }
  } catch {
    return 0;
  }
  if (!value) return 0;
  const doc = Array.isArray(value) ? { content: value } : value;
  const text = extractTextFromNode(doc);
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

// Books handlers
export const bookHandlers = {
  getAll: handleRequest(async () => {
    return await db.select().from(books).orderBy(desc(books.createdAt));
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
    return result[0] || null;
  }),

  getOverview: handleRequest(async (id) => {
    const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
    const book = result[0] || null;
    if (!book) return null;

    const [
      chapterCountResult,
      sceneCountResult,
      characterCountResult,
      worldCountResult,
      locationCountResult,
      objectCountResult,
      scenesForStats,
    ] = await Promise.all([
      db.select({ count: sql`COUNT(*)` }).from(chapters).where(eq(chapters.bookId, id)),
      db.select({ count: sql`COUNT(*)` }).from(scenes).where(eq(scenes.bookId, id)),
      db.select({ count: sql`COUNT(*)` }).from(characters).where(eq(characters.bookId, id)),
      db.select({ count: sql`COUNT(*)` }).from(worlds).where(eq(worlds.bookId, id)),
      db.select({ count: sql`COUNT(*)` }).from(locations).where(eq(locations.bookId, id)),
      db.select({ count: sql`COUNT(*)` }).from(objects).where(eq(objects.bookId, id)),
      db
        .select({ content: scenes.content, status: scenes.status, createdAt: scenes.createdAt })
        .from(scenes)
        .where(eq(scenes.bookId, id)),
    ]);

    const chapterCount = Number(chapterCountResult[0]?.count ?? 0);
    const sceneCount = Number(sceneCountResult[0]?.count ?? 0);
    const characterCount = Number(characterCountResult[0]?.count ?? 0);
    const worldCount = Number(worldCountResult[0]?.count ?? 0);
    const locationCount = Number(locationCountResult[0]?.count ?? 0);
    const objectCount = Number(objectCountResult[0]?.count ?? 0);

    let totalWords = 0;
    let scenesWithContent = 0;
    let firstSceneAt = null;
    let lastSceneAt = null;
    const sceneStatusCounts = {};

    for (const scene of scenesForStats) {
      const words = countWordsFromContent(scene.content);
      if (words > 0) {
        totalWords += words;
        scenesWithContent += 1;
      }
      const statusKey = scene.status || 'unspecified';
      sceneStatusCounts[statusKey] = (sceneStatusCounts[statusKey] || 0) + 1;
      if (scene.createdAt != null) {
        if (firstSceneAt == null || scene.createdAt < firstSceneAt) {
          firstSceneAt = scene.createdAt;
        }
        if (lastSceneAt == null || scene.createdAt > lastSceneAt) {
          lastSceneAt = scene.createdAt;
        }
      }
    }

    const averageWordsPerScene = scenesWithContent > 0 ? Math.round(totalWords / scenesWithContent) : 0;
    const averageScenesPerChapter = chapterCount > 0 ? Math.round((sceneCount / chapterCount) * 10) / 10 : 0;

    return {
      book,
      stats: {
        chapters: chapterCount,
        scenes: sceneCount,
        characters: characterCount,
        worlds: worldCount,
        locations: locationCount,
        objects: objectCount,
        words: {
          total: totalWords,
          averagePerScene: averageWordsPerScene,
        },
        structure: {
          scenesPerChapter: averageScenesPerChapter,
        },
        sceneStatusCounts,
        writingPeriod: {
          firstSceneAt,
          lastSceneAt,
        },
      },
    };
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
