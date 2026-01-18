import { ipcMain } from 'electron';
import { bookHandlers } from './books.js';
import { seriesHandlers, bookSeriesHandlers } from './series.js';
import { characterHandlers } from './characters.js';
import { worldHandlers, locationHandlers, objectHandlers } from './world.js';
import { chapterHandlers, sceneHandlers, writingHandlers } from './writing.js';
import { imageHandlers } from './imageHandler.js';
import { storeHandlers } from './store.js';

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
  ipcMain.handle('series:archive', seriesHandlers.archive);
  ipcMain.handle('series:unarchive', seriesHandlers.unarchive);

  // Book-Series relationship channels
  ipcMain.handle('bookSeries:addBookToSeries', bookSeriesHandlers.addBookToSeries);
  ipcMain.handle('bookSeries:removeBookFromSeries', bookSeriesHandlers.removeBookFromSeries);
  ipcMain.handle('bookSeries:updateBookPosition', bookSeriesHandlers.updateBookPosition);
  ipcMain.handle('bookSeries:reorderSeries', bookSeriesHandlers.reorderSeries);

  // Character channels
  ipcMain.handle('characters:getAllByBook', characterHandlers.getAllByBook);
  ipcMain.handle('characters:getById', characterHandlers.getById);
  ipcMain.handle('characters:create', characterHandlers.create);
  ipcMain.handle('characters:update', characterHandlers.update);
  ipcMain.handle('characters:delete', characterHandlers.delete);
  ipcMain.handle('characters:getRelationships', characterHandlers.getRelationships);
  ipcMain.handle('characters:addRelationship', characterHandlers.addRelationship);
  ipcMain.handle('characters:updateRelationship', characterHandlers.updateRelationship);
  ipcMain.handle('characters:removeRelationship', characterHandlers.removeRelationship);
  ipcMain.handle('characters:reorder', characterHandlers.reorder);

  // World channels
  ipcMain.handle('worlds:getAllByBook', worldHandlers.getAllByBook);
  ipcMain.handle('worlds:getById', worldHandlers.getById);
  ipcMain.handle('worlds:create', worldHandlers.create);
  ipcMain.handle('worlds:update', worldHandlers.update);
  ipcMain.handle('worlds:delete', worldHandlers.delete);
  ipcMain.handle('worlds:reorder', worldHandlers.reorder);

  // Location channels
  ipcMain.handle('locations:getAllByBook', locationHandlers.getAllByBook);
  ipcMain.handle('locations:getById', locationHandlers.getById);
  ipcMain.handle('locations:create', locationHandlers.create);
  ipcMain.handle('locations:update', locationHandlers.update);
  ipcMain.handle('locations:delete', locationHandlers.delete);
  ipcMain.handle('locations:reorder', locationHandlers.reorder);

  // Object channels
  ipcMain.handle('objects:getAllByBook', objectHandlers.getAllByBook);
  ipcMain.handle('objects:getById', objectHandlers.getById);
  ipcMain.handle('objects:create', objectHandlers.create);
  ipcMain.handle('objects:update', objectHandlers.update);
  ipcMain.handle('objects:delete', objectHandlers.delete);
  ipcMain.handle('objects:reorder', objectHandlers.reorder);

  // Chapter channels
  ipcMain.handle('chapters:getAllByBook', chapterHandlers.getAllByBook);
  ipcMain.handle('chapters:getById', chapterHandlers.getById);
  ipcMain.handle('chapters:create', chapterHandlers.create);
  ipcMain.handle('chapters:update', chapterHandlers.update);
  ipcMain.handle('chapters:delete', chapterHandlers.delete);
  ipcMain.handle('chapters:reorder', chapterHandlers.reorder);

  // Scene channels
  ipcMain.handle('scenes:getAllByChapter', sceneHandlers.getAllByChapter);
  ipcMain.handle('scenes:getAllByBook', sceneHandlers.getAllByBook);
  ipcMain.handle('scenes:getById', sceneHandlers.getById);
  ipcMain.handle('scenes:create', sceneHandlers.create);
  ipcMain.handle('scenes:update', sceneHandlers.update);
  ipcMain.handle('scenes:delete', sceneHandlers.delete);
  ipcMain.handle('scenes:reorder', sceneHandlers.reorder);
  ipcMain.handle('scenes:moveToChapter', sceneHandlers.moveToChapter);

  // Writing channels
  ipcMain.handle('writing:getAllForPreview', writingHandlers.getAllForPreview);

  // Image channels
  ipcMain.handle('image:save', imageHandlers.saveImage);
  ipcMain.handle('image:getData', imageHandlers.getImageData);
  ipcMain.handle('image:delete', imageHandlers.deleteImage);

  // Store channels
  ipcMain.handle('store:get', storeHandlers.get);
  ipcMain.handle('store:set', storeHandlers.set);
  ipcMain.handle('store:delete', storeHandlers.delete);
  ipcMain.handle('store:clear', storeHandlers.clear);
  ipcMain.handle('store:has', storeHandlers.has);
  ipcMain.handle('store:getAll', storeHandlers.getAll);
}