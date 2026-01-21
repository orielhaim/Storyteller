/**
 * Export content to PDF using Electron's webContents.printToPDF()
 * @param {Object} options - Export options
 * @param {Object} options.editor - TipTap editor instance
 * @param {string} options.bookTitle - Book title for default filename
 * @param {string} options.selectedChapterId - Selected chapter ID ('all' or specific chapter)
 * @returns {Promise<void>}
 */
export async function exportToPdf({ editor, bookTitle = 'book', selectedChapterId = 'all' }) {
  if (!editor) {
    throw new Error('Editor instance is required for PDF export');
  }

  if (!window.exportAPI) {
    throw new Error('Export API is not available. Make sure you are running in Electron.');
  }

  try {
    // Generate default filename based on book title and chapter selection
    const chapterSuffix = selectedChapterId === 'all' ? '' : ` - Chapter ${selectedChapterId}`;
    const defaultFilename = `${bookTitle}${chapterSuffix}.pdf`;

    // Show save dialog
    const filePath = await window.exportAPI.showSaveDialog(defaultFilename, [
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'All Files', extensions: ['*'] },
    ]);

    if (!filePath) {
      // User cancelled the dialog
      return { success: false, cancelled: true };
    }

    // Configure PDF options based on pagination settings
    // Default to A4 size (matches pagination settings: 800px height, 789px width)
    // A4: 210mm x 297mm (8.27" x 11.69")
    // Convert pixels to inches: 789px / 96 DPI ≈ 8.22", 800px / 96 DPI ≈ 8.33"
    // But A4 is 8.27" x 11.69", so we'll use A4 and let Electron handle scaling
    const pdfOptions = {
      pageSize: 'A4',
      margins: {
        top: 0.79,    // ~20px at 96 DPI (0.79 inches)
        bottom: 0.79,
        left: 0.52,   // ~50px at 96 DPI (0.52 inches) - reduced to prevent cutoff
        right: 0.52,
      },
      printBackground: true,
      scale: 1.0,
    };

    // Get the editor's DOM element and its HTML
    const editorElement = editor.view.dom.closest('.preview-editor-wrapper');
    if (!editorElement) {
      throw new Error('Could not find editor element');
    }

    // Clone the editor element to avoid modifying the original
    const clonedElement = editorElement.cloneNode(true);
    
    // Create a complete HTML document with styles
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    body {
      background: #f3f4f6;
      padding: 0;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .preview-editor-wrapper {
      background: #f3f4f6;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
      min-width: 100%;
      max-width: 100%;
    }
    .preview-editor-content {
      background: white;
      width: 100%;
      max-width: 100%;
    }
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      .preview-editor-wrapper {
        background: white;
        padding: 0;
        margin: 0;
        width: 100%;
      }
    }
  </style>
</head>
<body>
  ${clonedElement.outerHTML}
</body>
</html>`;

    // Generate and save PDF in one call
    await window.exportAPI.exportToPdf(filePath, htmlContent, pdfOptions);
    
    return { success: true, filePath };
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}
