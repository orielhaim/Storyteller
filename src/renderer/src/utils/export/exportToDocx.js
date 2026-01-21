/**
 * Export content to DOCX using @turbodocx/html-to-docx
 * @param {Object} options - Export options
 * @param {Object} options.editor - TipTap editor instance
 * @param {string} options.bookTitle - Book title for default filename
 * @param {string} options.selectedChapterId - Selected chapter ID ('all' or specific chapter)
 * @returns {Promise<void>}
 */
export async function exportToDocx({ editor, bookTitle = 'book', selectedChapterId = 'all' }) {
  if (!editor) {
    throw new Error('Editor instance is required for DOCX export');
  }

  if (!window.exportAPI) {
    throw new Error('Export API is not available. Make sure you are running in Electron.');
  }

  try {
    // Generate default filename based on book title and chapter selection
    const chapterSuffix = selectedChapterId === 'all' ? '' : ` - Chapter ${selectedChapterId}`;
    const defaultFilename = `${bookTitle}${chapterSuffix}.docx`;

    // Show save dialog
    const filePath = await window.exportAPI.showSaveDialog(defaultFilename, [
      { name: 'DOCX Files', extensions: ['docx'] },
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

    // Configure DOCX options
    const docxOptions = {
      orientation: 'portrait',
      pageSize: { width: 12240, height: 15840 }, // Letter size in twips
      margins: {
        top: 1440,    // 1 inch = 1440 twips
        right: 1440,
        bottom: 1440,
        left: 1440,
      },
      title: bookTitle,
      creator: 'Storyteller',
      pageNumber: true,
    };

    // Generate and save DOCX
    await window.exportAPI.exportToDocx(filePath, contentHtml, docxOptions);
    
    return { success: true, filePath };
  } catch (error) {
    console.error('DOCX export error:', error);
    throw error;
  }
}
