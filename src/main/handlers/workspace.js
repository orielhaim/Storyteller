import db from '../db.js';
import handleRequest from '../utils/handleRequest.js';

const loadWorkspaceState = (bookId) => {
  const row = db
    .prepare(
      `SELECT dockview_layout AS dockviewLayout, panel_layout AS panelLayout
       FROM workspace_state WHERE book_id = ?`,
    )
    .get(bookId);

  if (!row) return null;

  return {
    dockviewLayout: row.dockviewLayout ? JSON.parse(row.dockviewLayout) : null,
    panelLayout: row.panelLayout ? JSON.parse(row.panelLayout) : null,
  };
};

const saveWorkspaceState = (bookId, state) => {
  const { dockviewLayout, panelLayout } = state;
  db.prepare(
    `INSERT INTO workspace_state (book_id, dockview_layout, panel_layout, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(book_id) DO UPDATE SET
       dockview_layout = excluded.dockview_layout,
       panel_layout = excluded.panel_layout,
       updated_at = excluded.updated_at`,
  ).run(
    bookId,
    JSON.stringify(dockviewLayout ?? {}),
    panelLayout ? JSON.stringify(panelLayout) : null,
    Date.now(),
  );

  return true;
};

export const workspaceHandlers = {
  load: handleRequest((bookId) => loadWorkspaceState(bookId)),
  save: handleRequest((bookId, state) => saveWorkspaceState(bookId, state)),
};
