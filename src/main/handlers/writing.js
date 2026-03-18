import db from '../db.js';
import handleRequest from '../utils/handleRequest.js';

function mapChapter(row) {
  return row || null;
}

function mapScene(row) {
  return row || null;
}

function getChapterById(id) {
  return mapChapter(
    db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          name,
          description,
          status,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM chapters
        WHERE id = ?
        LIMIT 1`
      )
      .get(id)
  );
}

function getSceneById(id) {
  return mapScene(
    db
      .prepare(
        `SELECT
          id,
          chapter_id AS chapterId,
          book_id AS bookId,
          name,
          content,
          status,
          start_date AS startDate,
          end_date AS endDate,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM scenes
        WHERE id = ?
        LIMIT 1`
      )
      .get(id)
  );
}

function normalizeJsonForDb(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

// Chapters handlers
export const chapterHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    return db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          name,
          description,
          status,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM chapters
        WHERE book_id = ?
        ORDER BY position ASC, created_at ASC`
      )
      .all(bookId);
  }),

  getById: handleRequest(async (id) => {
    return getChapterById(id);
  }),

  create: handleRequest(async ({ bookId, name, description, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const max = db.prepare('SELECT MAX(position) AS max FROM chapters WHERE book_id = ?').get(bookId)?.max;
      finalPosition = (max ?? -1) + 1;
    }

    const info = db
      .prepare(
        `INSERT INTO chapters (
          book_id, name, description, status, position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(bookId, name, description || null, null, finalPosition, now, now);
    return getChapterById(Number(info.lastInsertRowid));
  }),

  update: handleRequest(async (id, { name, description, status, position }) => {
    const sets = [];
    const params = [];
    if (name !== undefined) {
      sets.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      sets.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      sets.push('status = ?');
      params.push(status);
    }
    if (position !== undefined) {
      sets.push('position = ?');
      params.push(position);
    }
    sets.push('updated_at = ?');
    params.push(Date.now());

    db.prepare(`UPDATE chapters SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    return getChapterById(id);
  }),

  delete: handleRequest(async (id) => {
    db.prepare('DELETE FROM chapters WHERE id = ?').run(id);
    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, chapterIds) => {
    const stmt = db.prepare('UPDATE chapters SET position = ?, updated_at = ? WHERE id = ? AND book_id = ?');
    const now = Date.now();
    const tx = db.transaction(() => {
      chapterIds.forEach((chapterId, index) => {
        stmt.run(index, now, chapterId, bookId);
      });
    });
    tx();
    return { reordered: true };
  }),
};

// Scenes handlers
export const sceneHandlers = {
  getAllByChapter: handleRequest(async (chapterId) => {
    return db
      .prepare(
        `SELECT
          id,
          chapter_id AS chapterId,
          book_id AS bookId,
          name,
          content,
          status,
          start_date AS startDate,
          end_date AS endDate,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM scenes
        WHERE chapter_id = ?
        ORDER BY position ASC, created_at ASC`
      )
      .all(chapterId);
  }),

  getAllByBook: handleRequest(async (bookId) => {
    return db
      .prepare(
        `SELECT
          id,
          chapter_id AS chapterId,
          book_id AS bookId,
          name,
          content,
          status,
          start_date AS startDate,
          end_date AS endDate,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM scenes
        WHERE book_id = ?
        ORDER BY position ASC, created_at ASC`
      )
      .all(bookId);
  }),

  getById: handleRequest(async (id) => {
    return getSceneById(id);
  }),

  create: handleRequest(async ({ chapterId, bookId, name, content, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const max = db.prepare('SELECT MAX(position) AS max FROM scenes WHERE chapter_id = ?').get(chapterId)?.max;
      finalPosition = (max ?? -1) + 1;
    }

    const info = db
      .prepare(
        `INSERT INTO scenes (
          chapter_id, book_id, name, content, status, start_date, end_date, position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        chapterId,
        bookId,
        name,
        normalizeJsonForDb(content),
        null,
        null,
        null,
        finalPosition,
        now,
        now
      );
    return getSceneById(Number(info.lastInsertRowid));
  }),

  update: handleRequest(async (id, { name, content, position, status, startDate, endDate }) => {
    const sets = [];
    const params = [];
    if (name !== undefined) {
      sets.push('name = ?');
      params.push(name);
    }
    if (content !== undefined) {
      sets.push('content = ?');
      params.push(normalizeJsonForDb(content));
    }
    if (position !== undefined) {
      sets.push('position = ?');
      params.push(position);
    }
    if (status !== undefined) {
      sets.push('status = ?');
      params.push(status);
    }
    if (startDate !== undefined) {
      sets.push('start_date = ?');
      params.push(startDate ? new Date(startDate).getTime() : null);
    }
    if (endDate !== undefined) {
      sets.push('end_date = ?');
      params.push(endDate ? new Date(endDate).getTime() : null);
    }
    sets.push('updated_at = ?');
    params.push(Date.now());

    db.prepare(`UPDATE scenes SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    return getSceneById(id);
  }),

  delete: handleRequest(async (id) => {
    db.prepare('DELETE FROM scenes WHERE id = ?').run(id);
    return { deleted: true };
  }),

  reorder: handleRequest(async (chapterId, sceneIds) => {
    const stmt = db.prepare('UPDATE scenes SET position = ?, updated_at = ? WHERE id = ? AND chapter_id = ?');
    const now = Date.now();
    const tx = db.transaction(() => {
      sceneIds.forEach((sceneId, index) => {
        stmt.run(index, now, sceneId, chapterId);
      });
    });
    tx();
    return { reordered: true };
  }),

  moveToChapter: handleRequest(async (sceneId, targetChapterId) => {
    // Get the scene to validate it exists and get current chapter
    const scene = getSceneById(sceneId);
    if (!scene) {
      throw new Error('Scene not found');
    }

    const currentChapterId = scene.chapterId;

    // If moving to the same chapter, do nothing
    if (currentChapterId === targetChapterId) {
      return { moved: false, message: 'Scene already in target chapter' };
    }

    // Get the max position in the target chapter
    const max = db.prepare('SELECT MAX(position) AS max FROM scenes WHERE chapter_id = ?').get(targetChapterId)?.max;
    const newPosition = (max ?? -1) + 1;

    // Update the scene
    db.prepare('UPDATE scenes SET chapter_id = ?, position = ?, updated_at = ? WHERE id = ?').run(
      targetChapterId,
      newPosition,
      Date.now(),
      sceneId
    );
    const movedScene = getSceneById(sceneId);

    return {
      moved: true,
      scene: movedScene,
      oldChapterId: currentChapterId,
      newChapterId: targetChapterId
    };
  }),
};

// Writing handlers for preview
export const writingHandlers = {
  getAllForPreview: handleRequest(async (bookId) => {
    // Fetch chapters ordered by position
    const chaptersList = db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          name,
          description,
          status,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM chapters
        WHERE book_id = ?
        ORDER BY position ASC, created_at ASC`
      )
      .all(bookId);
    
    // Fetch all scenes for the book ordered by chapter position and scene position
    const scenesList = db
      .prepare(
        `SELECT
          id,
          chapter_id AS chapterId,
          book_id AS bookId,
          name,
          content,
          status,
          start_date AS startDate,
          end_date AS endDate,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM scenes
        WHERE book_id = ?
        ORDER BY position ASC, created_at ASC`
      )
      .all(bookId);
    
    // Group scenes by chapter
    const scenesByChapter = {};
    scenesList.forEach(scene => {
      if (!scenesByChapter[scene.chapterId]) {
        scenesByChapter[scene.chapterId] = [];
      }
      scenesByChapter[scene.chapterId].push(scene);
    });
    
    // Combine chapters with their scenes
    return chaptersList.map(chapter => ({
      ...chapter,
      scenes: scenesByChapter[chapter.id] || []
    }));
  }),
};