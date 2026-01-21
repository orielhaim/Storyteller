import { dialog, BrowserWindow } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import HtmlToDocx from '@turbodocx/html-to-docx';
import { EPub } from '@lesjoursfr/html-to-epub';
import handleRequest from '../utils/handleRequest.js';

async function saveFile(filePath, buffer) {
  if (!filePath) {
    throw new Error('File path is required');
  }

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer data');
  }

  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(filePath, buffer);
}

export const exportHandlers = {
  showSaveDialog: async (event, defaultFilename, filters) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow) {
        throw new Error('Could not find main window');
      }

      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultFilename,
        filters: filters || [
          { name: 'All Files', extensions: ['*'] }
        ],
      });

      if (result.canceled) {
        return { success: true, data: null };
      }

      return { success: true, data: result.filePath };
    } catch (error) {
      console.error('IPC Handler Error:', error);
      return { success: false, error: error.message };
    }
  },

  exportToPdf: handleRequest(async (filePath, htmlContent, pdfOptions) => {
    if (!filePath) {
      throw new Error('File path is required');
    }

    let tempWindow = null;
    
    try {
      tempWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      await tempWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const pdfBuffer = await tempWindow.webContents.printToPDF(pdfOptions);
      
      await saveFile(filePath, pdfBuffer);
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Error generating and saving PDF:', error);
      throw error;
    } finally {
      if (tempWindow && !tempWindow.isDestroyed()) {
        tempWindow.close();
      }
    }
  }),

  exportToDocx: handleRequest(async (filePath, htmlContent, docxOptions) => {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      // Extract content from the HTML wrapper
      // The HTML might contain wrapper divs, we want the actual content
      const headerHtml = docxOptions?.headerHtml || '';
      const options = {
        orientation: docxOptions?.orientation || 'portrait',
        pageSize: docxOptions?.pageSize || { width: 12240, height: 15840 }, // Letter size in twips (1/20th of a point)
        margins: docxOptions?.margins || {
          top: 1440,    // 1 inch = 1440 twips
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
        title: docxOptions?.title || 'Document',
        creator: docxOptions?.creator || 'Storyteller',
        pageNumber: docxOptions?.pageNumber !== false,
      };

      // Convert HTML to DOCX
      const docxArrayBuffer = await HtmlToDocx(htmlContent, headerHtml, options);
      
      // Convert ArrayBuffer to Buffer for Node.js
      const buffer = Buffer.from(docxArrayBuffer);
      
      await saveFile(filePath, buffer);
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Error generating and saving DOCX:', error);
      throw error;
    }
  }),

  exportToTxt: handleRequest(async (filePath, textContent) => {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      // Convert text content to Buffer with UTF-8 encoding
      const buffer = Buffer.from(textContent, 'utf-8');
      
      await saveFile(filePath, buffer);
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Error saving TXT file:', error);
      throw error;
    }
  }),

  exportToEpub: handleRequest(async (filePath, htmlContent, epubOptions) => {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      // Use content from epubOptions if provided, otherwise create a single chapter from htmlContent
      const content = epubOptions?.content || [
        {
          title: epubOptions?.title || 'Content',
          data: htmlContent,
        },
      ];

      const options = {
        title: epubOptions?.title || 'Book',
        author: epubOptions?.author || ['Storyteller'],
        publisher: epubOptions?.publisher || 'Storyteller',
        lang: epubOptions?.lang || 'en',
        version: epubOptions?.version || 3,
        tocTitle: epubOptions?.tocTitle || 'Table of Contents',
        appendChapterTitles: epubOptions?.appendChapterTitles !== false,
        hideToC: epubOptions?.hideToC || false,
        css: epubOptions?.css || `
          body {
            font-family: Georgia, serif;
            line-height: 1.6;
            margin: 1em;
            padding: 0;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1em;
            margin-bottom: 0.5em;
          }
          p {
            margin-bottom: 1em;
            text-align: justify;
          }
        `,
        content,
      };

      // Create EPUB instance
      const epub = new EPub(options, filePath);

      // Generate EPUB
      await epub.render();
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Error generating and saving EPUB:', error);
      throw error;
    }
  }),
};