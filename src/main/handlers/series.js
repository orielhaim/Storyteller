import db from '../db.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';

function mapSeries(row) {
  if (!row) return null;
  return { ...row, archived: !!row.archived };
}

function getSeriesById(id) {
  return mapSeries(
    db
      .prepare(
        `SELECT
          id,
          name,
          description,
          image,
          created_at AS createdAt,
          updated_at AS updatedAt,
          archived
        FROM series
        WHERE id = ?
        LIMIT 1`
      )
      .get(id)
  );
}

function mapBook(row) {
  if (!row) return null;
  let genres = [];
  try {
    genres = row.genres ? JSON.parse(row.genres) : [];
  } catch {
    genres = [];
  }
  return { ...row, genres, archived: !!row.archived };
}

// Series handlers
export const seriesHandlers = {
  getAll: handleRequest(async () => {
    const rows = db
      .prepare(
        `SELECT
          id,
          name,
          description,
          image,
          created_at AS createdAt,
          updated_at AS updatedAt,
          archived
        FROM series
        ORDER BY created_at DESC`
      )
      .all();
    return rows.map(mapSeries);
  }),

  getById: handleRequest(async (id) => {
    return getSeriesById(id);
  }),

  getBooks: handleRequest(async (seriesId) => {
    const rows = db
      .prepare(
        `SELECT
          b.id,
          b.name,
          b.author,
          b.description,
          b.image,
          b.progress_status AS progressStatus,
          b.genres,
          b.target_audience AS targetAudience,
          b.primary_language AS primaryLanguage,
          b.created_at AS createdAt,
          b.updated_at AS updatedAt,
          b.archived,
          bs.position
        FROM book_series bs
        INNER JOIN books b ON b.id = bs.book_id
        WHERE bs.series_id = ?
        ORDER BY bs.position ASC`
      )
      .all(seriesId);
    return rows.map(mapBook);
  }),

  create: handleRequest(async ({ name, description, image }) => {
    const now = Date.now();
    const info = db
      .prepare(
        `INSERT INTO series (
          name, description, image, created_at, updated_at, archived
        ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(name, description || null, image || null, now, now, 0);
    return getSeriesById(Number(info.lastInsertRowid));
  }),

  update: handleRequest(async (id, { name, description, image }) => {
    const sets = [];
    const params = [];
    if (name !== undefined) {
      sets.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      sets.push('description = ?');
      params.push(description || null);
    }
    if (image !== undefined) {
      sets.push('image = ?');
      params.push(image || null);
    }
    sets.push('updated_at = ?');
    params.push(Date.now());

    if (sets.length > 0) {
      db.prepare(`UPDATE series SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    }
    return getSeriesById(id);
  }),

  delete: handleRequest(async (id) => {
    // Get series to check for image
    const row = db.prepare('SELECT image FROM series WHERE id = ? LIMIT 1').get(id);
    if (row?.image) {
      await imageHandlers.deleteImage(null, row.image);
    }

    db.prepare('DELETE FROM series WHERE id = ?').run(id);
    return { deleted: true };
  }),

  archive: handleRequest(async (id) => {
    db.prepare('UPDATE series SET archived = 1, updated_at = ? WHERE id = ?').run(Date.now(), id);
    return getSeriesById(id);
  }),

  unarchive: handleRequest(async (id) => {
    db.prepare('UPDATE series SET archived = 0, updated_at = ? WHERE id = ?').run(Date.now(), id);
    return getSeriesById(id);
  }),
};

// Book-Series relationship handlers
export const bookSeriesHandlers = {
  addBookToSeries: handleRequest(async (bookId, seriesId, position = null) => {
    // If position not provided, get max position and add 1
    if (position === null) {
      const max = db
        .prepare('SELECT MAX(position) AS max FROM book_series WHERE series_id = ?')
        .get(seriesId)?.max;
      position = (max ?? -1) + 1;
    }

    const info = db
      .prepare('INSERT INTO book_series (book_id, series_id, position) VALUES (?, ?, ?)')
      .run(bookId, seriesId, position);
    return db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          series_id AS seriesId,
          position
        FROM book_series
        WHERE id = ?
        LIMIT 1`
      )
      .get(Number(info.lastInsertRowid));
  }),

  removeBookFromSeries: handleRequest(async (bookId, seriesId) => {
    db.prepare('DELETE FROM book_series WHERE book_id = ? AND series_id = ?').run(bookId, seriesId);
    return { removed: true };
  }),

  updateBookPosition: handleRequest(async (bookId, seriesId, newPosition) => {
    db.prepare('UPDATE book_series SET position = ? WHERE book_id = ? AND series_id = ?').run(
      newPosition,
      bookId,
      seriesId
    );
    return db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          series_id AS seriesId,
          position
        FROM book_series
        WHERE book_id = ? AND series_id = ?
        LIMIT 1`
      )
      .get(bookId, seriesId);
  }),

  reorderSeries: handleRequest(async (seriesId, bookIds) => {
    // Update positions for all books in the series atomically
    const update = db.prepare('UPDATE book_series SET position = ? WHERE book_id = ? AND series_id = ?');
    const tx = db.transaction(() => {
      bookIds.forEach((bookId, index) => {
        update.run(index, bookId, seriesId);
      });
    });
    tx();
    return { reordered: true };
  }),
};