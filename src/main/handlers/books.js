import db from '../db.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';
import parseJson from '../../utils/parseJson';

function mapBook(row) {
  if (!row) return null;
  return {
    ...row,
    genres: parseJson(row.genres, []),
    archived: !!row.archived,
  };
}

function getBookById(id) {
  return mapBook(
    db
      .prepare(
        `SELECT
          id,
          name,
          author,
          description,
          image,
          progress_status AS progressStatus,
          genres,
          target_audience AS targetAudience,
          primary_language AS primaryLanguage,
          created_at AS createdAt,
          updated_at AS updatedAt,
          archived
        FROM books
        WHERE id = ?
        LIMIT 1`,
      )
      .get(id),
  );
}

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
    const rows = db
      .prepare(
        `SELECT
          id,
          name,
          author,
          description,
          image,
          progress_status AS progressStatus,
          genres,
          target_audience AS targetAudience,
          primary_language AS primaryLanguage,
          created_at AS createdAt,
          updated_at AS updatedAt,
          archived
        FROM books
        ORDER BY created_at DESC`,
      )
      .all();
    return rows.map(mapBook);
  }),

  getById: handleRequest(async (id) => {
    return getBookById(id);
  }),

  getOverview: handleRequest(async (id) => {
    const book = getBookById(id);
    if (!book) return null;

    const chapterCount = Number(
      db
        .prepare('SELECT COUNT(*) AS count FROM chapters WHERE book_id = ?')
        .get(id)?.count ?? 0,
    );
    const sceneCount = Number(
      db
        .prepare('SELECT COUNT(*) AS count FROM scenes WHERE book_id = ?')
        .get(id)?.count ?? 0,
    );
    const characterCount = Number(
      db
        .prepare('SELECT COUNT(*) AS count FROM characters WHERE book_id = ?')
        .get(id)?.count ?? 0,
    );
    const worldCount = Number(
      db
        .prepare('SELECT COUNT(*) AS count FROM worlds WHERE book_id = ?')
        .get(id)?.count ?? 0,
    );
    const locationCount = Number(
      db
        .prepare('SELECT COUNT(*) AS count FROM locations WHERE book_id = ?')
        .get(id)?.count ?? 0,
    );
    const objectCount = Number(
      db
        .prepare('SELECT COUNT(*) AS count FROM objects WHERE book_id = ?')
        .get(id)?.count ?? 0,
    );
    const scenesForStats = db
      .prepare(
        'SELECT content, status, created_at AS createdAt FROM scenes WHERE book_id = ?',
      )
      .all(id);

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

    const averageWordsPerScene =
      scenesWithContent > 0 ? Math.round(totalWords / scenesWithContent) : 0;
    const averageScenesPerChapter =
      chapterCount > 0 ? Math.round((sceneCount / chapterCount) * 10) / 10 : 0;

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

  create: handleRequest(
    async ({
      name,
      author,
      description,
      image,
      progressStatus,
      genres,
      targetAudience,
      primaryLanguage,
    }) => {
      const now = Date.now();
      const insert = db.prepare(
        `INSERT INTO books (
        name, author, description, image, progress_status, genres, target_audience, primary_language, created_at, updated_at, archived
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      const info = insert.run(
        name,
        author,
        description || null,
        image || null,
        progressStatus || 'not_started',
        JSON.stringify(genres || []),
        targetAudience || 'general',
        primaryLanguage || 'en',
        now,
        now,
        0,
      );
      return getBookById(Number(info.lastInsertRowid));
    },
  ),

  update: handleRequest(
    async (
      id,
      {
        name,
        author,
        description,
        image,
        progressStatus,
        genres,
        targetAudience,
        primaryLanguage,
      },
    ) => {
      const sets = [];
      const params = [];

      if (name !== undefined) {
        sets.push('name = ?');
        params.push(name);
      }
      if (author !== undefined) {
        sets.push('author = ?');
        params.push(author);
      }
      if (description !== undefined) {
        sets.push('description = ?');
        params.push(description || null);
      }
      if (image !== undefined) {
        sets.push('image = ?');
        params.push(image || null);
      }
      if (progressStatus !== undefined) {
        sets.push('progress_status = ?');
        params.push(progressStatus || 'not_started');
      }
      if (genres !== undefined) {
        sets.push('genres = ?');
        params.push(JSON.stringify(genres || []));
      }
      if (targetAudience !== undefined) {
        sets.push('target_audience = ?');
        params.push(targetAudience || 'general');
      }
      if (primaryLanguage !== undefined) {
        sets.push('primary_language = ?');
        params.push(primaryLanguage || 'en');
      }

      sets.push('updated_at = ?');
      params.push(Date.now());

      if (sets.length === 0) return getBookById(id);

      db.prepare(`UPDATE books SET ${sets.join(', ')} WHERE id = ?`).run(
        ...params,
        id,
      );
      return getBookById(id);
    },
  ),

  delete: handleRequest(async (id) => {
    // Get book to check for image
    const row = db
      .prepare('SELECT image FROM books WHERE id = ? LIMIT 1')
      .get(id);
    if (row?.image) {
      await imageHandlers.deleteImage(null, row.image);
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(id);
    return { deleted: true };
  }),

  archive: handleRequest(async (id) => {
    db.prepare(
      'UPDATE books SET archived = 1, updated_at = ? WHERE id = ?',
    ).run(Date.now(), id);
    return getBookById(id);
  }),

  unarchive: handleRequest(async (id) => {
    db.prepare(
      'UPDATE books SET archived = 0, updated_at = ? WHERE id = ?',
    ).run(Date.now(), id);
    return getBookById(id);
  }),
};
