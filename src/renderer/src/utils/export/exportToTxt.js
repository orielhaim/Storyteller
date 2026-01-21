/**
 * Export content to Plain Text (TXT)
 * @param {Object} options - Export options
 * @param {Object} options.editor - TipTap editor instance
 * @param {string} options.bookTitle - Book title for default filename
 * @param {string} options.selectedChapterId - Selected chapter ID ('all' or specific chapter)
 * @returns {Promise<void>}
 */
export async function exportToTxt({ editor, bookTitle = 'book', selectedChapterId = 'all' }) {
  if (!editor) {
    throw new Error('Editor instance is required for TXT export');
  }

  if (!window.exportAPI) {
    throw new Error('Export API is not available. Make sure you are running in Electron.');
  }

  try {
    // Generate default filename based on book title and chapter selection
    const chapterSuffix = selectedChapterId === 'all' ? '' : ` - Chapter ${selectedChapterId}`;
    const defaultFilename = `${bookTitle}${chapterSuffix}.txt`;

    // Show save dialog
    const filePath = await window.exportAPI.showSaveDialog(defaultFilename, [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] },
    ]);

    if (!filePath) {
      // User cancelled the dialog
      return { success: false, cancelled: true };
    }

    // Get plain text content from the editor
    const textContent = editor.getText();

    // Save the text content
    await window.exportAPI.exportToTxt(filePath, textContent);
    
    return { success: true, filePath };
  } catch (error) {
    console.error('TXT export error:', error);
    throw error;
  }
}
