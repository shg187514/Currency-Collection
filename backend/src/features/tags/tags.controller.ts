import { Request, Response } from 'express';
import { TagsService } from './tags.service';

export class TagsController {
  static async getTags(req: Request, res: Response) {
    try {
      const tags = await TagsService.getTags();
      res.status(200).json({ success: true, data: tags });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  static async createTag(req: Request, res: Response) {
    try {
      const tag = await TagsService.createTag(req.body);
      res.status(201).json({ success: true, data: tag });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  static async updateTag(req: Request, res: Response) {
    try {
      const tag = await TagsService.updateTag(req.params.id, req.body);
      res.status(200).json({ success: true, data: tag });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  static async deleteTag(req: Request, res: Response) {
    try {
      await TagsService.deleteTag(req.params.id);
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
}
