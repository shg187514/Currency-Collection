import { Router } from 'express';
import { TagsController } from './tags.controller';

const router = Router();

router.get('/', TagsController.getTags);
router.post('/', TagsController.createTag);
router.put('/:id', TagsController.updateTag);
router.delete('/:id', TagsController.deleteTag);

export default router;
