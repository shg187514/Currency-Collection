import prisma from '../../common/utils/prisma';
import fs from 'fs';
import path from 'path';

export class AttachmentsService {
  static async uploadAttachment(nodeId: string, file: Express.Multer.File) {
    // Save metadata in database and log history
    const attachment = await prisma.attachment.create({
      data: {
        nodeId,
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype,
      },
    });

    await prisma.history.create({
      data: {
        action: 'ATTACHMENT_UPLOADED',
        changes: JSON.stringify({ filename: file.originalname }),
        nodeId,
      },
    });
    return attachment;
  }

  static async deleteAttachment(id: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      throw { statusCode: 404, message: 'Attachment not found' };
    }

    // Delete file from disk using path.basename to prevent directory traversal
    const filename = path.basename(attachment.url);
    const uploadsDir = process.env.UPLOAD_DIRECTORY 
      ? path.resolve(process.env.UPLOAD_DIRECTORY)
      : path.join(process.cwd(), 'uploads');
    const filepath = path.join(uploadsDir, filename);
    
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (err) {
      console.error(`Failed to delete physical file: ${filepath}`, err);
    }

    // Delete metadata from database
    await prisma.attachment.delete({ where: { id } });

    await prisma.history.create({
      data: {
        action: 'ATTACHMENT_DELETED',
        changes: JSON.stringify({ filename }),
        nodeId: attachment.nodeId,
      },
    });

    return { success: true };
  }
}
