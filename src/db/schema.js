import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const books = table("books", {
  id: t.int().primaryKey({ autoIncrement: true }),
  name: t.text().notNull(),
  author: t.text().notNull(),
  description: t.text(),
  image: t.text("image"),
  progressStatus: t.text("progress_status").default("not_started").notNull(),
  genres: t.text("genres", { mode: "json" }).default([]),
  targetAudience: t.text("target_audience").default("general"),
  primaryLanguage: t.text("primary_language").default("en"),
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
  archived: t.integer("archived", { mode: "boolean" }).default(false).notNull(),
});

export const series = table("series", {
  id: t.int().primaryKey({ autoIncrement: true }),
  name: t.text().notNull(),
  description: t.text(),
  image: t.text("image"),
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
  archived: t.integer("archived", { mode: "boolean" }).default(false).notNull(),
});

export const bookSeries = table("book_series", {
  id: t.int().primaryKey({ autoIncrement: true }),
  bookId: t.int("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  seriesId: t.int("series_id").notNull().references(() => series.id, { onDelete: "cascade" }),
  position: t.integer().notNull().default(0),
}, (table) => [
  t.uniqueIndex("book_series_idx").on(table.bookId, table.seriesId),
]);

export const characters = table("characters", {
  id: t.int().primaryKey({ autoIncrement: true }),
  bookId: t.int("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  firstName: t.text("first_name").notNull(),
  lastName: t.text("last_name").notNull(),
  gender: t.text("gender"), // male, female, unicorn, null
  role: t.text().default("supporting").notNull(), // protagonist, supporting, antagonist, marginal
  avatar: t.text("avatar"),
  description: t.text(), // one-liner description
  attributes: t.text("attributes", { mode: "json" }).default({}), // JSON for custom fields and detailed info
  groups: t.text("groups", { mode: "json" }).default([]), // array of group names
  tags: t.text("tags", { mode: "json" }).default([]), // array of tags
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export const characterRelationships = table("character_relationships", {
  id: t.int().primaryKey({ autoIncrement: true }),
  characterId: t.int("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  relatedCharacterId: t.int("related_character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  relationshipType: t.text("relationship_type").notNull(), // father, mother, son, daughter, sibling, etc.
  metadata: t.text("metadata", { mode: "json" }).default({}), // engagement date, marriage date, etc.
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export const worlds = table("worlds", {
  id: t.int().primaryKey({ autoIncrement: true }),
  bookId: t.int("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  name: t.text().notNull(),
  description: t.text(),
  referenceImage: t.text("reference_image"),
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export const locations = table("locations", {
  id: t.int().primaryKey({ autoIncrement: true }),
  bookId: t.int("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  worldId: t.int("world_id").references(() => worlds.id, { onDelete: "set null" }),
  name: t.text().notNull(),
  city: t.text(),
  state: t.text(),
  nation: t.text(),
  description: t.text(),
  referenceImage: t.text("reference_image"),
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export const objects = table("objects", {
  id: t.int().primaryKey({ autoIncrement: true }),
  bookId: t.int("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  name: t.text().notNull(),
  description: t.text(),
  groups: t.text("groups", { mode: "json" }).default([]), // array of group names
  referenceImage: t.text("reference_image"),
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export const chapters = table("chapters", {
  id: t.int().primaryKey({ autoIncrement: true }),
  bookId: t.int("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  name: t.text().notNull(),
  description: t.text(),
  position: t.integer().notNull().default(0),
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export const scenes = table("scenes", {
  id: t.int().primaryKey({ autoIncrement: true }),
  chapterId: t.int("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  bookId: t.int("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  name: t.text().notNull(),
  content: t.text("content", { mode: "json" }).default(null),
  position: t.integer().notNull().default(0),
  createdAt: t.integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: t.integer("updated_at").notNull().$defaultFn(() => Date.now()),
});