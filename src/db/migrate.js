import db from '../main/db.js';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { app } from 'electron';

function getMigrationsFolder() {
  if (!app.isPackaged) {
    return path.join(process.cwd(), 'drizzle');
  }
  return path.join(process.resourcesPath, 'app.asar.unpacked', 'drizzle');
}

export function runMigrations() {
  try {
    const migrationsFolder = getMigrationsFolder();
    migrate(db, { migrationsFolder });

    console.log('✅ Migrations done.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  }
}