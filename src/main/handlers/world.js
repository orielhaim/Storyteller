import { eq, desc, asc, sql, and } from 'drizzle-orm';
import db from '../db.js';
import { worlds, locations, objects } from '../../db/schema.js';
import { imageHandlers } from './imageHandler.js';
import handleRequest from '../utils/handleRequest.js';

// Worlds handlers
export const worldHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    return await db.select().from(worlds).where(eq(worlds.bookId, bookId)).orderBy(asc(worlds.position), desc(worlds.createdAt));
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(worlds).where(eq(worlds.id, id)).limit(1);
    return result[0] || null;
  }),

  create: handleRequest(async ({ bookId, name, description, referenceImage, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const maxResult = await db
        .select({ max: sql`MAX(${worlds.position})` })
        .from(worlds)
        .where(eq(worlds.bookId, bookId));
      finalPosition = (maxResult[0]?.max ?? -1) + 1;
    }

    const result = await db.insert(worlds).values({
      bookId,
      name,
      description: description || null,
      referenceImage: referenceImage || null,
      position: finalPosition,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { name, description, referenceImage, position }) => {
    const updateData = {
      updatedAt: Date.now(),
    };

    // Only include fields that were explicitly provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (referenceImage !== undefined) updateData.referenceImage = referenceImage;
    if (position !== undefined) updateData.position = position;

    const result = await db.update(worlds)
      .set(updateData)
      .where(eq(worlds.id, id))
      .returning();
    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    // Get world to check for reference image
    const world = await db.select({ referenceImage: worlds.referenceImage }).from(worlds).where(eq(worlds.id, id)).limit(1);
    if (world[0]?.referenceImage) {
      await imageHandlers.deleteImage(null, world[0].referenceImage);
    }

    await db.delete(worlds).where(eq(worlds.id, id));
    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, worldIds) => {
    const updates = worldIds.map((worldId, index) =>
      db.update(worlds)
        .set({ position: index, updatedAt: Date.now() })
        .where(and(
          eq(worlds.id, worldId),
          eq(worlds.bookId, bookId)
        ))
    );

    await Promise.all(updates);
    return { reordered: true };
  }),
};

// Locations handlers
export const locationHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    return await db.select().from(locations).where(eq(locations.bookId, bookId)).orderBy(asc(locations.position), desc(locations.createdAt));
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
    return result[0] || null;
  }),

  create: handleRequest(async ({ bookId, worldId, name, city, state, nation, description, referenceImage, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const maxResult = await db
        .select({ max: sql`MAX(${locations.position})` })
        .from(locations)
        .where(eq(locations.bookId, bookId));
      finalPosition = (maxResult[0]?.max ?? -1) + 1;
    }

    const result = await db.insert(locations).values({
      bookId,
      worldId: worldId || null,
      name,
      city: city || null,
      state: state || null,
      nation: nation || null,
      description: description || null,
      referenceImage: referenceImage || null,
      position: finalPosition,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { worldId, name, city, state, nation, description, referenceImage, position }) => {
    const updateData = {
      updatedAt: Date.now(),
    };

    // Only include fields that were explicitly provided
    if (worldId !== undefined) updateData.worldId = worldId;
    if (name !== undefined) updateData.name = name;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (nation !== undefined) updateData.nation = nation;
    if (description !== undefined) updateData.description = description;
    if (referenceImage !== undefined) updateData.referenceImage = referenceImage;
    if (position !== undefined) updateData.position = position;

    const result = await db.update(locations)
      .set(updateData)
      .where(eq(locations.id, id))
      .returning();
    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    // Get location to check for reference image
    const location = await db.select({ referenceImage: locations.referenceImage }).from(locations).where(eq(locations.id, id)).limit(1);
    if (location[0]?.referenceImage) {
      await imageHandlers.deleteImage(null, location[0].referenceImage);
    }

    await db.delete(locations).where(eq(locations.id, id));
    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, locationIds) => {
    const updates = locationIds.map((locationId, index) =>
      db.update(locations)
        .set({ position: index, updatedAt: Date.now() })
        .where(and(
          eq(locations.id, locationId),
          eq(locations.bookId, bookId)
        ))
    );

    await Promise.all(updates);
    return { reordered: true };
  }),
};

// Objects handlers
export const objectHandlers = {
  getAllByBook: handleRequest(async (bookId) => {
    return await db.select().from(objects).where(eq(objects.bookId, bookId)).orderBy(asc(objects.position), desc(objects.createdAt));
  }),

  getById: handleRequest(async (id) => {
    const result = await db.select().from(objects).where(eq(objects.id, id)).limit(1);
    return result[0] || null;
  }),

  create: handleRequest(async ({ bookId, name, description, groups, referenceImage, position }) => {
    const now = Date.now();

    // If position not provided, get max position and add 1
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const maxResult = await db
        .select({ max: sql`MAX(${objects.position})` })
        .from(objects)
        .where(eq(objects.bookId, bookId));
      finalPosition = (maxResult[0]?.max ?? -1) + 1;
    }

    const result = await db.insert(objects).values({
      bookId,
      name,
      description: description || null,
      groups: groups || [],
      referenceImage: referenceImage || null,
      position: finalPosition,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }),

  update: handleRequest(async (id, { name, description, groups, referenceImage, position }) => {
    const updateData = {
      updatedAt: Date.now(),
    };

    // Only include fields that were explicitly provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (groups !== undefined) updateData.groups = groups;
    if (referenceImage !== undefined) updateData.referenceImage = referenceImage;
    if (position !== undefined) updateData.position = position;

    const result = await db.update(objects)
      .set(updateData)
      .where(eq(objects.id, id))
      .returning();
    return result[0] || null;
  }),

  delete: handleRequest(async (id) => {
    // Get object to check for reference image
    const object = await db.select({ referenceImage: objects.referenceImage }).from(objects).where(eq(objects.id, id)).limit(1);
    if (object[0]?.referenceImage) {
      await imageHandlers.deleteImage(null, object[0].referenceImage);
    }

    await db.delete(objects).where(eq(objects.id, id));
    return { deleted: true };
  }),

  reorder: handleRequest(async (bookId, objectIds) => {
    const updates = objectIds.map((objectId, index) =>
      db.update(objects)
        .set({ position: index, updatedAt: Date.now() })
        .where(and(
          eq(objects.id, objectId),
          eq(objects.bookId, bookId)
        ))
    );

    await Promise.all(updates);
    return { reordered: true };
  }),
};