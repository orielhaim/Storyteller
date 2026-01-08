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
});

export const bookSeries = table("book_series", {
  id: t.int().primaryKey({ autoIncrement: true }),
  bookId: t.int("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  seriesId: t.int("series_id").notNull().references(() => series.id, { onDelete: "cascade" }),
  position: t.integer().notNull().default(0),
}, (table) => [
  t.uniqueIndex("book_series_idx").on(table.bookId, table.seriesId),
]);
