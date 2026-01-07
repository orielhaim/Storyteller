import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export function runMigrations() {
  try {
    // Ensure the database directory exists
    const dbPath = path.resolve('./sqlite.db');
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    const sqlite = new Database(dbPath);

    // Create drizzle instance
    const db = drizzle({ client: sqlite });

    // Run migrations
    migrate(db, { migrationsFolder: './drizzle' });

    console.log('✅ Database migrations completed successfully');

    return db;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}