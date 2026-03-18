import db from '../db.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';
import parseJson from '../../utils/parseJson';

function mapWorld(row) {
  return row || null;
}

function getWorldById(id) {
  return mapWorld(
    db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          name,
          description,
          reference_image AS referenceImage,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM worlds
        WHERE id = ?
        LIMIT 1`
      )
      .get(id)
  );
}

function mapLocation(row) {
  return row || null;
}

function getLocationById(id) {
  return mapLocation(
    db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          world_id AS worldId,
          name,
          city,
          state,
          nation,
          description,
          reference_image AS referenceImage,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM locations
        WHERE id = ?
        LIMIT 1`
      )
      .get(id)
  );
}

function mapObject(row) {
  if (!row) return null;
  return { ...row, groups: parseJson(row.groups, []) };
}

function getObjectById(id) {
  return mapObject(
    db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          name,
          description,
          groups,
          reference_image AS referenceImage,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM objects
        WHERE id = ?
        LIMIT 1`
      )
      .get(id)
  );
}

// Worlds handlers
export const worldHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    const rows = db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          name,
          description,
          reference_image AS referenceImage,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM worlds
        WHERE book_id = ?
        ORDER BY position ASC, created_at DESC`
      )
      .all(bookId);
    return rows.map(mapWorld);
  }),

  getById: handleRequest(async (id) => {
    return getWorldById(id);
  }),

  create: handleRequest(async ({ bookId, name, description, referenceImage, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const max = db.prepare('SELECT MAX(position) AS max FROM worlds WHERE book_id = ?').get(bookId)?.max;
      finalPosition = (max ?? -1) + 1;
    }

    const info = db
      .prepare(
        `INSERT INTO worlds (
          book_id, name, description, reference_image, position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(bookId, name, description || null, referenceImage || null, finalPosition, now, now);
    return getWorldById(Number(info.lastInsertRowid));
  }),

  update: handleRequest(async (id, { name, description, referenceImage, position }) => {
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
    if (referenceImage !== undefined) {
      sets.push('reference_image = ?');
      params.push(referenceImage);
    }
    if (position !== undefined) {
      sets.push('position = ?');
      params.push(position);
    }
    sets.push('updated_at = ?');
    params.push(Date.now());

    db.prepare(`UPDATE worlds SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    return getWorldById(id);
  }),

  delete: handleRequest(async (id) => {
    // Get world to check for reference image
    const row = db.prepare('SELECT reference_image AS referenceImage FROM worlds WHERE id = ? LIMIT 1').get(id);
    if (row?.referenceImage) {
      await imageHandlers.deleteImage(null, row.referenceImage);
    }

    db.prepare('DELETE FROM worlds WHERE id = ?').run(id);
    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, worldIds) => {
    const stmt = db.prepare('UPDATE worlds SET position = ?, updated_at = ? WHERE id = ? AND book_id = ?');
    const now = Date.now();
    const tx = db.transaction(() => {
      worldIds.forEach((worldId, index) => {
        stmt.run(index, now, worldId, bookId);
      });
    });
    tx();
    return { reordered: true };
  }),
};

// Locations handlers
export const locationHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    const rows = db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          world_id AS worldId,
          name,
          city,
          state,
          nation,
          description,
          reference_image AS referenceImage,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM locations
        WHERE book_id = ?
        ORDER BY position ASC, created_at DESC`
      )
      .all(bookId);
    return rows.map(mapLocation);
  }),

  getById: handleRequest(async (id) => {
    return getLocationById(id);
  }),

  create: handleRequest(async ({ bookId, worldId, name, city, state, nation, description, referenceImage, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const max = db.prepare('SELECT MAX(position) AS max FROM locations WHERE book_id = ?').get(bookId)?.max;
      finalPosition = (max ?? -1) + 1;
    }

    const info = db
      .prepare(
        `INSERT INTO locations (
          book_id, world_id, name, city, state, nation, description, reference_image, position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        bookId,
        worldId || null,
        name,
        city || null,
        state || null,
        nation || null,
        description || null,
        referenceImage || null,
        finalPosition,
        now,
        now
      );
    return getLocationById(Number(info.lastInsertRowid));
  }),

  update: handleRequest(async (id, { worldId, name, city, state, nation, description, referenceImage, position }) => {
    const sets = [];
    const params = [];
    if (worldId !== undefined) {
      sets.push('world_id = ?');
      params.push(worldId);
    }
    if (name !== undefined) {
      sets.push('name = ?');
      params.push(name);
    }
    if (city !== undefined) {
      sets.push('city = ?');
      params.push(city);
    }
    if (state !== undefined) {
      sets.push('state = ?');
      params.push(state);
    }
    if (nation !== undefined) {
      sets.push('nation = ?');
      params.push(nation);
    }
    if (description !== undefined) {
      sets.push('description = ?');
      params.push(description);
    }
    if (referenceImage !== undefined) {
      sets.push('reference_image = ?');
      params.push(referenceImage);
    }
    if (position !== undefined) {
      sets.push('position = ?');
      params.push(position);
    }
    sets.push('updated_at = ?');
    params.push(Date.now());

    db.prepare(`UPDATE locations SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    return getLocationById(id);
  }),

  delete: handleRequest(async (id) => {
    // Get location to check for reference image
    const row = db.prepare('SELECT reference_image AS referenceImage FROM locations WHERE id = ? LIMIT 1').get(id);
    if (row?.referenceImage) {
      await imageHandlers.deleteImage(null, row.referenceImage);
    }

    db.prepare('DELETE FROM locations WHERE id = ?').run(id);
    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, locationIds) => {
    const stmt = db.prepare('UPDATE locations SET position = ?, updated_at = ? WHERE id = ? AND book_id = ?');
    const now = Date.now();
    const tx = db.transaction(() => {
      locationIds.forEach((locationId, index) => {
        stmt.run(index, now, locationId, bookId);
      });
    });
    tx();
    return { reordered: true };
  }),
};

// Objects handlers
export const objectHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    const rows = db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          name,
          description,
          groups,
          reference_image AS referenceImage,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM objects
        WHERE book_id = ?
        ORDER BY position ASC, created_at DESC`
      )
      .all(bookId);
    return rows.map(mapObject);
  }),

  getById: handleRequest(async (id) => {
    return getObjectById(id);
  }),

  create: handleRequest(async ({ bookId, name, description, groups, referenceImage, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const max = db.prepare('SELECT MAX(position) AS max FROM objects WHERE book_id = ?').get(bookId)?.max;
      finalPosition = (max ?? -1) + 1;
    }

    const info = db
      .prepare(
        `INSERT INTO objects (
          book_id, name, description, groups, reference_image, position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        bookId,
        name,
        description || null,
        JSON.stringify(groups || []),
        referenceImage || null,
        finalPosition,
        now,
        now
      );
    return getObjectById(Number(info.lastInsertRowid));
  }),

  update: handleRequest(async (id, { name, description, groups, referenceImage, position }) => {
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
    if (groups !== undefined) {
      sets.push('groups = ?');
      params.push(JSON.stringify(groups || []));
    }
    if (referenceImage !== undefined) {
      sets.push('reference_image = ?');
      params.push(referenceImage);
    }
    if (position !== undefined) {
      sets.push('position = ?');
      params.push(position);
    }
    sets.push('updated_at = ?');
    params.push(Date.now());

    db.prepare(`UPDATE objects SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    return getObjectById(id);
  }),

  delete: handleRequest(async (id) => {
    // Get object to check for reference image
    const row = db.prepare('SELECT reference_image AS referenceImage FROM objects WHERE id = ? LIMIT 1').get(id);
    if (row?.referenceImage) {
      await imageHandlers.deleteImage(null, row.referenceImage);
    }

    db.prepare('DELETE FROM objects WHERE id = ?').run(id);
    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, objectIds) => {
    const stmt = db.prepare('UPDATE objects SET position = ?, updated_at = ? WHERE id = ? AND book_id = ?');
    const now = Date.now();
    const tx = db.transaction(() => {
      objectIds.forEach((objectId, index) => {
        stmt.run(index, now, objectId, bookId);
      });
    });
    tx();
    return { reordered: true };
  }),
};