import { Request, Response } from 'express';
import { AttachmentsService } from './attachments.service';
import fs from 'fs';

export class AttachmentsController {
  static async uploadAttachment(req: Request, res: Response) {
    const { nodeId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      const attachment = await AttachmentsService.uploadAttachment(nodeId, req.file);
      res.status(201).json({ success: true, data: attachment });
    } catch (err: any) {
      // Clean up orphaned file on failure
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupErr) {
        console.error('Failed to clean up orphaned file:', cleanupErr);
      }
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  static async deleteAttachment(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await AttachmentsService.deleteAttachment(id);
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
}
