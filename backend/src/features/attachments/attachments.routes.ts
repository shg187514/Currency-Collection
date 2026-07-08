import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AttachmentsController } from './attachments.controller';

const router = Router({ mergeParams: true }); // Important for nested routes if needed, though we mount specifically

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = process.env.UPLOAD_DIRECTORY 
      ? path.resolve(process.env.UPLOAD_DIRECTORY)
      : path.join(process.cwd(), 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename to avoid overwrites
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Block dangerous executable and script files
    const blockedExtensions = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.html', '.htm'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (blockedExtensions.includes(ext)) {
      return cb(new Error(`File type ${ext} is not permitted for security reasons.`));
    }
    
    cb(null, true);
  }
});

// Upload attachment to a specific node (note: nodeId will be in the URL params handled by the main router)
// E.g. POST /api/nodes/:nodeId/attachments
router.post('/nodes/:nodeId/attachments', upload.single('file'), AttachmentsController.uploadAttachment);

// Delete attachment
// E.g. DELETE /api/attachments/:id
router.delete('/attachments/:id', AttachmentsController.deleteAttachment);

export default router;
