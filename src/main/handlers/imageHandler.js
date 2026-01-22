import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import handleRequest from '../utils/handleRequest.js';

// Get the images directory path
function getImagesDir() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'images');
}

// Ensure images directory exists
async function ensureImagesDir() {
  const imagesDir = getImagesDir();
  try {
    await fs.access(imagesDir);
  } catch {
    await fs.mkdir(imagesDir, { recursive: true });
  }
  return imagesDir;
}

// Image handlers
export const imageHandlers = {
  saveImage: handleRequest(async (base64Data, originalFilename) => {
    const imagesDir = await ensureImagesDir();

    // Generate UUID for filename
    const generatedUuid = uuidv4();

    // Extract file extension from original filename
    const ext = path.extname(originalFilename) || '.jpg';

    // Create new filename
    const filename = `${generatedUuid}${ext}`;
    const filepath = path.join(imagesDir, filename);

    // Remove base64 prefix if present (data:image/jpeg;base64,)
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

    // Convert base64 to buffer and save
    const imageBuffer = Buffer.from(base64Image, 'base64');
    await fs.writeFile(filepath, imageBuffer);

    return { uuid: generatedUuid, filename, filepath };
  }),

  getImageData: handleRequest(async (imageUuid) => {
    if (!imageUuid) return null;

    const imagesDir = await ensureImagesDir();

    // Find file with matching UUID
    const files = await fs.readdir(imagesDir);
    const imageFile = files.find(file => file.startsWith(imageUuid + '.'));

    if (!imageFile) return null;

    const filepath = path.join(imagesDir, imageFile);
    const buffer = await fs.readFile(filepath);
    const base64 = buffer.toString('base64');

    // Get file extension to determine MIME type
    const ext = path.extname(imageFile).toLowerCase();
    const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                     ext === '.png' ? 'image/png' :
                     ext === '.gif' ? 'image/gif' :
                     'image/jpeg'; // fallback

    return `data:${mimeType};base64,${base64}`;
  }),

  deleteImage: handleRequest(async (imageUuid) => {
    if (!imageUuid) return { deleted: false };

    const imagesDir = await ensureImagesDir();

    // Find and delete file with matching UUID
    const files = await fs.readdir(imagesDir);
    const imageFile = files.find(file => file.startsWith(imageUuid + '.'));

    if (!imageFile) return { deleted: false };

    const filepath = path.join(imagesDir, imageFile);
    await fs.unlink(filepath);

    return { deleted: true };
  }),
};