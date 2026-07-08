import { Router } from 'express';
import { StatsController } from './stats.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(StatsController.getStats));

export default router;
