import { ipcMain } from 'electron';
import { bookHandlers, seriesHandlers, bookSeriesHandlers } from './bookHandler.js';
import { imageHandlers } from './imageHandler.js';

export function registerIpcHandlers() {
  // Books channels
  ipcMain.handle('books:getAll', bookHandlers.getAll);
  ipcMain.handle('books:getById', bookHandlers.getById);
  ipcMain.handle('books:create', bookHandlers.create);
  ipcMain.handle('books:update', bookHandlers.update);
  ipcMain.handle('books:delete', bookHandlers.delete);
  ipcMain.handle('books:archive', bookHandlers.archive);
  ipcMain.handle('books:unarchive', bookHandlers.unarchive);

  // Series channels
  ipcMain.handle('series:getAll', seriesHandlers.getAll);
  ipcMain.handle('series:getById', seriesHandlers.getById);
  ipcMain.handle('series:getBooks', seriesHandlers.getBooks);
  ipcMain.handle('series:create', seriesHandlers.create);
  ipcMain.handle('series:update', seriesHandlers.update);
  ipcMain.handle('series:delete', seriesHandlers.delete);

  // Book-Series relationship channels
  ipcMain.handle('bookSeries:addBookToSeries', bookSeriesHandlers.addBookToSeries);
  ipcMain.handle('bookSeries:removeBookFromSeries', bookSeriesHandlers.removeBookFromSeries);
  ipcMain.handle('bookSeries:updateBookPosition', bookSeriesHandlers.updateBookPosition);
  ipcMain.handle('bookSeries:reorderSeries', bookSeriesHandlers.reorderSeries);

  // Image channels
  ipcMain.handle('image:save', imageHandlers.saveImage);
  ipcMain.handle('image:getData', imageHandlers.getImageData);
  ipcMain.handle('image:delete', imageHandlers.deleteImage);
}
