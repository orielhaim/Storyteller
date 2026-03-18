import db from '../db.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';
import parseJson from '../../utils/parseJson';

function mapCharacter(row) {
  if (!row) return null;
  return {
    ...row,
    attributes: parseJson(row.attributes, {}),
    groups: parseJson(row.groups, []),
    tags: parseJson(row.tags, []),
  };
}

function getCharacterById(id) {
  return mapCharacter(
    db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          first_name AS firstName,
          last_name AS lastName,
          gender,
          role,
          avatar,
          description,
          attributes,
          groups,
          tags,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM characters
        WHERE id = ?
        LIMIT 1`
      )
      .get(id)
  );
}

const RELATIONSHIP_RECIPROCALS = {
  'parent': 'child',
  'child': 'parent',
  'sibling': 'sibling',
  'spouse': 'spouse',
  'engaged': 'engaged',
  'friend': 'friend',
  'enemy': 'enemy',
  'mentor': 'apprentice',
  'apprentice': 'mentor',
};

const TYPE_TO_NEUTRAL = {
  'father': 'parent',
  'mother': 'parent',
  'parent': 'parent',
  'son': 'child',
  'daughter': 'child',
  'child': 'child',
  'brother': 'sibling',
  'sister': 'sibling',
  'sibling': 'sibling',
  'husband': 'spouse',
  'wife': 'spouse',
  'spouse': 'spouse',
  'fiancé': 'engaged',
  'fiancée': 'engaged',
  'engaged': 'engaged',
};

export const characterHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    const rows = db
      .prepare(
        `SELECT
          id,
          book_id AS bookId,
          first_name AS firstName,
          last_name AS lastName,
          gender,
          role,
          avatar,
          description,
          attributes,
          groups,
          tags,
          position,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM characters
        WHERE book_id = ?
        ORDER BY position ASC, created_at DESC`
      )
      .all(bookId);
    return rows.map(mapCharacter);
  }),

  getById: handleRequest(async (id) => {
    return getCharacterById(id);
  }),

  create: handleRequest(async ({ bookId, first_name, last_name, gender, role, avatar, description, attributes, groups, tags, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const max = db
        .prepare('SELECT MAX(position) AS max FROM characters WHERE book_id = ?')
        .get(bookId)?.max;
      finalPosition = (max ?? -1) + 1;
    }

    const info = db
      .prepare(
        `INSERT INTO characters (
          book_id, first_name, last_name, gender, role, avatar, description, attributes, groups, tags, position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        bookId,
        first_name,
        last_name || '',
        gender === undefined ? null : gender,
        role || 'supporting',
        avatar || null,
        description || null,
        JSON.stringify(attributes || {}),
        JSON.stringify(groups || []),
        JSON.stringify(tags || []),
        finalPosition,
        now,
        now
      );
    return getCharacterById(Number(info.lastInsertRowid));
  }),

  update: handleRequest(async (id, { first_name, last_name, gender, role, avatar, description, attributes, groups, tags, position }) => {
    const sets = [];
    const params = [];
    if (first_name !== undefined) {
      sets.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name !== undefined) {
      sets.push('last_name = ?');
      params.push(last_name);
    }
    if (gender !== undefined) {
      sets.push('gender = ?');
      params.push(gender);
    }
    if (role !== undefined) {
      sets.push('role = ?');
      params.push(role);
    }
    if (avatar !== undefined) {
      sets.push('avatar = ?');
      params.push(avatar);
    }
    if (description !== undefined) {
      sets.push('description = ?');
      params.push(description);
    }
    if (attributes !== undefined) {
      sets.push('attributes = ?');
      params.push(JSON.stringify(attributes || {}));
    }
    if (groups !== undefined) {
      sets.push('groups = ?');
      params.push(JSON.stringify(groups || []));
    }
    if (tags !== undefined) {
      sets.push('tags = ?');
      params.push(JSON.stringify(tags || []));
    }
    if (position !== undefined) {
      sets.push('position = ?');
      params.push(position);
    }

    sets.push('updated_at = ?');
    params.push(Date.now());

    db.prepare(`UPDATE characters SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    return getCharacterById(id);
  }),

  delete: handleRequest(async (id) => {
    const row = db.prepare('SELECT avatar FROM characters WHERE id = ? LIMIT 1').get(id);
    if (row?.avatar) {
      await imageHandlers.deleteImage(null, row.avatar);
    }

    db.prepare('DELETE FROM characters WHERE id = ?').run(id);
    return { deleted: true };
  }),

  getRelationships: handleRequest(async (characterId) => {
    const rows = db
      .prepare(
        `SELECT
          cr.id,
          cr.character_id AS characterId,
          cr.related_character_id AS relatedCharacterId,
          cr.relationship_type AS relationshipType,
          cr.metadata,
          c.id AS related_id,
          c.first_name AS related_firstName,
          c.last_name AS related_lastName,
          c.avatar AS related_avatar,
          c.gender AS related_gender
        FROM character_relationships cr
        INNER JOIN characters c ON c.id = cr.related_character_id
        WHERE cr.character_id = ?`
      )
      .all(characterId);

    return rows.map((row) => ({
      id: row.id,
      characterId: row.characterId,
      relatedCharacterId: row.relatedCharacterId,
      relationshipType: row.relationshipType,
      metadata: parseJson(row.metadata, {}),
      relatedCharacter: {
        id: row.related_id,
        firstName: row.related_firstName,
        lastName: row.related_lastName,
        avatar: row.related_avatar,
        gender: row.related_gender,
      },
    }));
  }),

  addRelationship: handleRequest(async ({ characterId, relatedCharacterId, relationshipType, metadata }) => {
    const now = Date.now();
    const neutralType = TYPE_TO_NEUTRAL[relationshipType] || relationshipType;
    
    const info = db
      .prepare(
        `INSERT INTO character_relationships (
          character_id, related_character_id, relationship_type, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(characterId, relatedCharacterId, neutralType, JSON.stringify(metadata || {}), now, now);

    const resultRow = db
      .prepare(
        `SELECT
          id,
          character_id AS characterId,
          related_character_id AS relatedCharacterId,
          relationship_type AS relationshipType,
          metadata,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM character_relationships
        WHERE id = ?
        LIMIT 1`
      )
      .get(Number(info.lastInsertRowid));

    const reciprocalType = RELATIONSHIP_RECIPROCALS[neutralType] || neutralType;
    
    const existingReciprocal = db
      .prepare(
        `SELECT id FROM character_relationships
         WHERE character_id = ? AND related_character_id = ?
         LIMIT 1`
      )
      .get(relatedCharacterId, characterId);

    if (!existingReciprocal?.id) {
      db.prepare(
        `INSERT INTO character_relationships (
          character_id, related_character_id, relationship_type, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        relatedCharacterId,
        characterId,
        reciprocalType,
        JSON.stringify(metadata || {}),
        now,
        now
      );
    }

    return {
      ...resultRow,
      metadata: parseJson(resultRow?.metadata, {}),
    };
  }),

  updateRelationship: handleRequest(async (id, { relationshipType, metadata }) => {
    const sets = [];
    const params = [];
    let neutralType;
    if (relationshipType !== undefined) {
      neutralType = TYPE_TO_NEUTRAL[relationshipType] || relationshipType;
      sets.push('relationship_type = ?');
      params.push(neutralType);
    }
    if (metadata !== undefined) {
      sets.push('metadata = ?');
      params.push(JSON.stringify(metadata || {}));
    }
    sets.push('updated_at = ?');
    params.push(Date.now());

    db.prepare(`UPDATE character_relationships SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);

    const rel = db
      .prepare(
        `SELECT
          id,
          character_id AS characterId,
          related_character_id AS relatedCharacterId,
          relationship_type AS relationshipType,
          metadata,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM character_relationships
        WHERE id = ?
        LIMIT 1`
      )
      .get(id);

    if (rel) {
      const reciprocal = db
        .prepare(
          `SELECT id FROM character_relationships
           WHERE character_id = ? AND related_character_id = ?
           LIMIT 1`
        )
        .get(rel.relatedCharacterId, rel.characterId);
      
      if (reciprocal?.id) {
        const reciprocalSets = [];
        const reciprocalParams = [];
        if (metadata !== undefined) {
          reciprocalSets.push('metadata = ?');
          reciprocalParams.push(JSON.stringify(metadata || {}));
        }
        if (neutralType !== undefined) {
          reciprocalSets.push('relationship_type = ?');
          reciprocalParams.push(RELATIONSHIP_RECIPROCALS[neutralType] || neutralType);
        }
        reciprocalSets.push('updated_at = ?');
        reciprocalParams.push(Date.now());

        db.prepare(`UPDATE character_relationships SET ${reciprocalSets.join(', ')} WHERE id = ?`).run(
          ...reciprocalParams,
          reciprocal.id
        );
      }
    }

    return {
      ...rel,
      metadata: parseJson(rel?.metadata, {}),
    };
  }),

  removeRelationship: handleRequest(async (id) => {
    const rel = db
      .prepare(
        `SELECT
          id,
          character_id AS characterId,
          related_character_id AS relatedCharacterId
        FROM character_relationships
        WHERE id = ?
        LIMIT 1`
      )
      .get(id);
    if (!rel) return { deleted: false };

    db.prepare(
      `DELETE FROM character_relationships
       WHERE id = ?
          OR (character_id = ? AND related_character_id = ?)`
    ).run(id, rel.relatedCharacterId, rel.characterId);

    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, characterIds) => {
    const update = db.prepare('UPDATE characters SET position = ?, updated_at = ? WHERE id = ? AND book_id = ?');
    const now = Date.now();
    const tx = db.transaction(() => {
      characterIds.forEach((characterId, index) => {
        update.run(index, now, characterId, bookId);
      });
    });
    tx();
    return { reordered: true };
  }),
};