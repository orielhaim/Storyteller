import { eq, desc } from 'drizzle-orm';
import db from '../db.js';
import { characters } from '../../db/schema.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';

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