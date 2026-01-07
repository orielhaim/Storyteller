import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

const sqlite = new Database(path.resolve('./sqlite.db'));
const db = drizzle({ client: sqlite });

export default db;