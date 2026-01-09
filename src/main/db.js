import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = app.isPackaged 
  ? path.join(app.getPath('userData'), 'sqlite.db')
  : path.join(process.cwd(), 'sqlite.db');

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

export { sqlite };
export default db;