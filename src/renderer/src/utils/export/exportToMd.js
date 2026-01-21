import { tiptapToMarkdown } from '@/lib/tiptap-to-markdown';

/**
 * Export content to Markdown using TipTap's markdown extension
 * @param {Object} options - Export options
 * @param {Object} options.editor - TipTap editor instance
 * @param {string} options.bookTitle - Book title for default filename
 * @param {string} options.selectedChapterId - Selected chapter ID ('all' or specific chapter)
 * @returns {Promise<void>}
 */
export async function exportToMd({ editor, bookTitle = 'book', selectedChapterId = 'all' }) {
  if (!editor) {
    throw new Error('Editor instance is required for Markdown export');
  }

  if (!window.exportAPI) {
    throw new Error('Export API is not available. Make sure you are running in Electron.');
  }

  try {
    const chapterSuffix = selectedChapterId === 'all' ? '' : ` - Chapter ${selectedChapterId}`;
    const defaultFilename = `${bookTitle}${chapterSuffix}.md`;

    const filePath = await window.exportAPI.showSaveDialog(defaultFilename, [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] },
    ]);

    if (!filePath) {
      return { success: false, cancelled: true };
    }

    const jsonContent = editor.getJSON();

    const markdownContent = tiptapToMarkdown(jsonContent);

    await window.exportAPI.exportToMd(filePath, markdownContent);
    
    return { success: true, filePath };
  } catch (error) {
    console.error('Markdown export error:', error);
    throw error;
  }
}
