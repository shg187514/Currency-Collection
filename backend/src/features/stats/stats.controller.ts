import { Request, Response } from 'express';
import { StatsService } from './stats.service';

export class StatsController {
  static async getStats(req: Request, res: Response) {
    const stats = await StatsService.getStats();
    res.status(200).json({ success: true, data: stats });
  }
}
