/**
 * Export content to EPUB using @lesjoursfr/html-to-epub
 * @param {Object} options - Export options
 * @param {Object} options.editor - TipTap editor instance
 * @param {string} options.bookTitle - Book title for default filename
 * @param {string} options.bookLanguage - Book language code
 * @param {string} options.selectedChapterId - Selected chapter ID ('all' or specific chapter)
 * @returns {Promise<void>}
 */
export async function exportToEpub({ editor, bookTitle = 'book', bookLanguage = 'en', selectedChapterId = 'all' }) {
  if (!editor) {
    throw new Error('Editor instance is required for EPUB export');
  }

  if (!window.exportAPI) {
    throw new Error('Export API is not available. Make sure you are running in Electron.');
  }

  try {
    // Generate default filename based on book title and chapter selection
    const chapterSuffix = selectedChapterId === 'all' ? '' : ` - Chapter ${selectedChapterId}`;
    const defaultFilename = `${bookTitle}${chapterSuffix}.epub`;

    // Show save dialog
    const filePath = await window.exportAPI.showSaveDialog(defaultFilename, [
      { name: 'EPUB Files', extensions: ['epub'] },
      { name: 'All Files', extensions: ['*'] },
    ]);

    if (!filePath) {
      // User cancelled the dialog
      return { success: false, cancelled: true };
    }

    // Get the editor's DOM element and extract HTML content
    const editorElement = editor.view.dom.closest('.preview-editor-wrapper');
    if (!editorElement) {
      throw new Error('Could not find editor element');
    }

    // Get the actual content HTML from the ProseMirror editor
    const contentElement = editorElement.querySelector('.preview-editor-content .ProseMirror');
    let contentHtml = editor.getHTML();
    
    // If we can find the ProseMirror content element, use its innerHTML
    // Otherwise fall back to editor.getHTML()
    if (contentElement) {
      contentHtml = contentElement.innerHTML;
    }

    // Configure EPUB options
    const epubOptions = {
      title: bookTitle,
      author: ['Storyteller'],
      lang: bookLanguage,
      version: 3,
      tocTitle: 'Table of Contents',
      appendChapterTitles: true,
      hideToC: false,
      content: [
        {
          title: bookTitle,
          data: contentHtml,
        },
      ],
    };

    // Generate and save EPUB
    await window.exportAPI.exportToEpub(filePath, contentHtml, epubOptions);
    
    return { success: true, filePath };
  } catch (error) {
    console.error('EPUB export error:', error);
    throw error;
  }
}
