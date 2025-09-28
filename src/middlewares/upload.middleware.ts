import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateUUID } from '../utils/common.util.js';

// Set directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set root directory to outside directory
const rootDir = path.resolve(__dirname, '../..');

// Configure multer to user local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(rootDir, 'src', 'uploads'));
        // cb(null, 'src/uploads'); // Temporary file storage path
    },
    filename: function (req, file, cb) {
        // Define original name from file
        const originalName = file.originalname;

        // Get extension file name
        const ext = path.extname(originalName);

        // Get file name without extension
        const baseName = path.basename(originalName, ext);

        // Generate UUID for unique name
        const uuid = generateUUID();

        // Define new file name
        const updatedFilename = `${baseName}-${uuid}${ext}`;
        cb(null, updatedFilename);
    },
});

const upload = multer({ storage });

export { upload };