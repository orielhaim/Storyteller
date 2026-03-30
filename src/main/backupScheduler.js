import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';
import Store from 'electron-store';
import { backupDatabaseToFile } from './db.js';

const store = new Store({ name: 'settings' });

const BACKUP_PREFIX = 'storyteller-backup-';
const BACKUP_EXT = '.db';
const MIN_RETRY_MS = 60_000;

const DEFAULTS = {
  enabled: false,
  intervalMinutes: 60,
  maxBackups: 10,
};

const LIMITS = {
  minBackups: 1,
  maxBackups: 100,
  minIntervalMinutes: 1,
};

let timer = null;

export function getDefaultBackupDir() {
  return path.join(app.getPath('documents'), 'Storyteller Backups');
}

function getBackupDir() {
  const custom = store.get('storage.backupPath');
  return typeof custom === 'string' && custom.trim()
    ? custom.trim()
    : getDefaultBackupDir();
}

function clampBackupCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULTS.maxBackups;
  return Math.min(
    LIMITS.maxBackups,
    Math.max(LIMITS.minBackups, Math.floor(n)),
  );
}

export function getBackupConfig() {
  return {
    enabled: store.get('storage.backupEnabled', DEFAULTS.enabled) === true,
    dir: getBackupDir(),
    intervalMinutes: Math.max(
      LIMITS.minIntervalMinutes,
      Number(
        store.get('storage.backupIntervalMinutes', DEFAULTS.intervalMinutes),
      ) || DEFAULTS.intervalMinutes,
    ),
    maxBackups: clampBackupCount(
      store.get('storage.maxBackupsToKeep', DEFAULTS.maxBackups),
    ),
  };
}

function toMs(minutes) {
  return Math.max(1, minutes) * 60_000;
}

function buildBackupPath(dir) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return path.join(dir, `${BACKUP_PREFIX}${stamp}${BACKUP_EXT}`);
}

function isBackupFile(name) {
  return name.startsWith(BACKUP_PREFIX) && name.endsWith(BACKUP_EXT);
}

async function listBackups(dir) {
  let names;
  try {
    names = await fs.readdir(dir);
  } catch {
    return [];
  }

  const results = [];

  for (const name of names) {
    if (!isBackupFile(name)) continue;
    try {
      const fullPath = path.join(dir, name);
      const { mtimeMs } = await fs.stat(fullPath);
      results.push({ path: fullPath, mtimeMs });
    } catch {
      /* file may have been removed between readdir and stat */
    }
  }

  return results.sort((a, b) => a.mtimeMs - b.mtimeMs);
}

async function getLatestBackupAge(dir) {
  const backups = await listBackups(dir);
  if (backups.length === 0) return null;
  return Date.now() - backups.at(-1).mtimeMs;
}

async function pruneOldBackups(dir, maxBackups) {
  const backups = await listBackups(dir);
  const deleteCount = Math.max(
    0,
    backups.length + 1 - clampBackupCount(maxBackups),
  );

  for (let i = 0; i < deleteCount; i++) {
    try {
      await fs.unlink(backups[i].path);
    } catch (err) {
      console.error('Failed to delete old backup:', err);
    }
  }
}

async function getNextDelay(dir, intervalMinutes, justCreated) {
  const intervalMs = toMs(intervalMinutes);

  if (justCreated) return intervalMs;

  const ageMs = await getLatestBackupAge(dir);
  if (ageMs == null) return intervalMs;

  return Math.max(MIN_RETRY_MS, intervalMs - ageMs);
}

function scheduleNext(delayMs) {
  timer = setTimeout(() => tick(), delayMs);
}

async function tick() {
  timer = null;

  const { enabled, dir, intervalMinutes, maxBackups } = getBackupConfig();
  if (!enabled) return;

  let justCreated = false;

  try {
    const ageMs = await getLatestBackupAge(dir);
    const isRecent = ageMs != null && ageMs < toMs(intervalMinutes);

    if (!isRecent) {
      await pruneOldBackups(dir, maxBackups);
      await backupDatabaseToFile(buildBackupPath(dir));
      justCreated = true;
    }
  } catch (err) {
    console.error('Scheduled backup failed:', err);
  }

  if (!getBackupConfig().enabled) return;

  const delay = await getNextDelay(dir, intervalMinutes, justCreated);
  scheduleNext(delay);
}

export async function runBackupNow() {
  const { dir, maxBackups } = getBackupConfig();
  await pruneOldBackups(dir, maxBackups);
  const filePath = buildBackupPath(dir);
  await backupDatabaseToFile(filePath);
  return filePath;
}

export function refreshBackupSchedule() {
  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }

  const { enabled, intervalMinutes } = getBackupConfig();
  if (!enabled) return;

  scheduleNext(toMs(intervalMinutes));
}
