// src/db/migrate.js
import db, { sqlite } from '../main/db.js';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import log from 'electron-log';

function getMigrationsFolder() {
  if (!app.isPackaged) {
    return path.join(process.cwd(), 'drizzle');
  }
  return path.join(process.resourcesPath, 'app.asar.unpacked', 'drizzle');
}

function getBackupPath() {
  const userDataPath = app.getPath('userData');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(userDataPath, 'backups', `backup-${timestamp}.db`);
}

function createBackup(dbPath) {
  const backupPath = getBackupPath();
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  sqlite.backup(backupPath);
  log.info(`✅ Backup created: ${backupPath}`);
  
  cleanOldBackups(backupDir, 5);
  
  return backupPath;
}

function cleanOldBackups(backupDir, keepCount) {
  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup-') && f.endsWith('.db'))
    .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime }))
    .sort((a, b) => b.time - a.time);
  
  files.slice(keepCount).forEach(f => {
    fs.unlinkSync(path.join(backupDir, f.name));
    log.info(`🗑️ Deleted old backup: ${f.name}`);
  });
}

export async function runMigrations() {
  const dbPath = app.isPackaged 
    ? path.join(app.getPath('userData'), 'sqlite.db')
    : path.join(process.cwd(), 'sqlite.db');
    
  const migrationsFolder = getMigrationsFolder();
  
  if (!hasPendingMigrations(migrationsFolder)) {
    return;
  }
  
  let backupPath = null;
  
  try {
    if (fs.existsSync(dbPath)) {
      backupPath = createBackup(dbPath);
    }
    
    migrate(db, { migrationsFolder });
    log.info('✅ Migrations completed successfully');
    
  } catch (err) {
    log.error('❌ Migration failed:', err);
    
    if (backupPath && fs.existsSync(backupPath)) {
      try {
        sqlite.close();
        fs.copyFileSync(backupPath, dbPath);
        log.info('✅ Database restored from backup');
      } catch (restoreErr) {
        log.error('❌ Failed to restore backup:', restoreErr);
      }
    }
    
    throw err;
  }
}

function hasPendingMigrations(migrationsFolder) {
  const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
  if (!fs.existsSync(journalPath)) return false;
  
  try {
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'));
    const appliedMigrations = getAppliedMigrations();
    
    return journal.entries.some(entry => !appliedMigrations.includes(entry.tag));
  } catch {
    return true;
  }
}

function getAppliedMigrations() {
  try {
    const result = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'"
    ).get();
    
    if (!result) return [];
    
    return sqlite.prepare('SELECT tag FROM __drizzle_migrations').all().map(r => r.tag);
  } catch {
    return [];
  }
}