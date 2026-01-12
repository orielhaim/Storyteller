import { eq, desc, and, or, asc, sql } from 'drizzle-orm';
import db from '../db.js';
import { characters, characterRelationships } from '../../db/schema.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';

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
    return await db.select().from(characters).where(eq(characters.bookId, bookId)).orderBy(asc(characters.position), desc(characters.createdAt));
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
    return result[0] || null;
  }),

  create: handleRequest(async ({ bookId, first_name, last_name, gender, role, avatar, description, attributes, groups, tags, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const maxResult = await db
        .select({ max: sql`MAX(${characters.position})` })
        .from(characters)
        .where(eq(characters.bookId, bookId));
      finalPosition = (maxResult[0]?.max ?? -1) + 1;
    }

    const result = await db.insert(characters).values({
      bookId,
      firstName: first_name,
      lastName: last_name || '',
      gender: gender === undefined ? null : gender,
      role: role || "supporting",
      avatar: avatar || null,
      description: description || null,
      attributes: attributes || {},
      groups: groups || [],
      tags: tags || [],
      position: finalPosition,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { first_name, last_name, gender, role, avatar, description, attributes, groups, tags, position }) => {
    const updateData = {
      updatedAt: Date.now(),
    };

    if (first_name !== undefined) updateData.firstName = first_name;
    if (last_name !== undefined) updateData.lastName = last_name;
    if (gender !== undefined) updateData.gender = gender;
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (description !== undefined) updateData.description = description;
    if (attributes !== undefined) updateData.attributes = attributes;
    if (groups !== undefined) updateData.groups = groups;
    if (tags !== undefined) updateData.tags = tags;
    if (position !== undefined) updateData.position = position;

    const result = await db.update(characters)
      .set(updateData)
      .where(eq(characters.id, id))
      .returning();

    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    const character = await db.select({ avatar: characters.avatar }).from(characters).where(eq(characters.id, id)).limit(1);
    if (character[0]?.avatar) {
      await imageHandlers.deleteImage(null, character[0].avatar);
    }

    await db.delete(characters).where(eq(characters.id, id));
    return { deleted: true };
  }),

  getRelationships: handleRequest(async (characterId) => {
    return await db.select({
      id: characterRelationships.id,
      characterId: characterRelationships.characterId,
      relatedCharacterId: characterRelationships.relatedCharacterId,
      relationshipType: characterRelationships.relationshipType,
      metadata: characterRelationships.metadata,
      relatedCharacter: {
        id: characters.id,
        firstName: characters.firstName,
        lastName: characters.lastName,
        avatar: characters.avatar,
        gender: characters.gender
      }
    })
    .from(characterRelationships)
    .innerJoin(characters, eq(characterRelationships.relatedCharacterId, characters.id))
    .where(eq(characterRelationships.characterId, characterId));
  }),

  addRelationship: handleRequest(async ({ characterId, relatedCharacterId, relationshipType, metadata }) => {
    const now = Date.now();
    const neutralType = TYPE_TO_NEUTRAL[relationshipType] || relationshipType;
    
    const result = await db.insert(characterRelationships).values({
      characterId,
      relatedCharacterId,
      relationshipType: neutralType,
      metadata: metadata || {},
      createdAt: now,
      updatedAt: now,
    }).returning();

    const reciprocalType = RELATIONSHIP_RECIPROCALS[neutralType] || neutralType;
    
    const existingReciprocal = await db.select().from(characterRelationships)
      .where(and(
        eq(characterRelationships.characterId, relatedCharacterId),
        eq(characterRelationships.relatedCharacterId, characterId)
      )).limit(1);
    
    if (!existingReciprocal[0]) {
      await db.insert(characterRelationships).values({
        characterId: relatedCharacterId,
        relatedCharacterId: characterId,
        relationshipType: reciprocalType,
        metadata: metadata || {}, 
        createdAt: now,
        updatedAt: now,
      });
    }

    return result[0];
  }),

  updateRelationship: handleRequest(async (id, { relationshipType, metadata }) => {
    const updateData = { updatedAt: Date.now() };
    let neutralType;
    if (relationshipType !== undefined) {
      neutralType = TYPE_TO_NEUTRAL[relationshipType] || relationshipType;
      updateData.relationshipType = neutralType;
    }
    if (metadata !== undefined) updateData.metadata = metadata;

    const result = await db.update(characterRelationships)
      .set(updateData)
      .where(eq(characterRelationships.id, id))
      .returning();

    const rel = result[0];
    if (rel) {
      const reciprocal = await db.select().from(characterRelationships)
        .where(and(
          eq(characterRelationships.characterId, rel.relatedCharacterId),
          eq(characterRelationships.relatedCharacterId, rel.characterId)
        )).limit(1);
      
      if (reciprocal[0]) {
        const reciprocalUpdate = { updatedAt: Date.now() };
        if (metadata !== undefined) reciprocalUpdate.metadata = metadata;
        if (neutralType !== undefined) {
          reciprocalUpdate.relationshipType = RELATIONSHIP_RECIPROCALS[neutralType] || neutralType;
        }

        await db.update(characterRelationships)
          .set(reciprocalUpdate)
          .where(eq(characterRelationships.id, reciprocal[0].id));
      }
    }

    return result[0] || null;
  }),

  removeRelationship: handleRequest(async (id) => {
    const rel = await db.select().from(characterRelationships).where(eq(characterRelationships.id, id)).limit(1);
    if (!rel[0]) return { deleted: false };

    await db.delete(characterRelationships).where(
      or(
        eq(characterRelationships.id, id),
        and(
          eq(characterRelationships.characterId, rel[0].relatedCharacterId),
          eq(characterRelationships.relatedCharacterId, rel[0].characterId)
        )
      )
    );

    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, characterIds) => {
    const updates = characterIds.map((characterId, index) =>
      db.update(characters)
        .set({ position: index, updatedAt: Date.now() })
        .where(and(
          eq(characters.id, characterId),
          eq(characters.bookId, bookId)
        ))
    );

    await Promise.all(updates);
    return { reordered: true };
  }),
};