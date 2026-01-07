import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.js',
  out: './drizzle',
  dbCredentials: {
    url: './sqlite.db',
  },
})