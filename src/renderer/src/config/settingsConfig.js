export const DEFAULT_SETTINGS = {
  editor: {
    wordCountEnabled: false,
    spellCheck: true,
  },
  updates: {
    channel: 'stable',
  },
  general: {
    theme: 'system',
    notifications: true,
    language: null,
  },
  developer: {
    isDeveloperMode: false,
  },
  storage: {
    backupEnabled: false,
    backupPath: null,
    backupIntervalMinutes: 60,
    maxBackupsToKeep: 10,
  },
  filters: {
    type: 'all',
    showBooksInSeries: false,
    showArchived: false,
  },
};
