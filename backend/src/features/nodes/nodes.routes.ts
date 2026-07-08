import { Router } from 'express';
import { NodeController } from './nodes.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

// Retrieve the full tree hierarchy
router.get('/tree', asyncHandler(NodeController.getTree));

// Trash
router.get('/trash', asyncHandler(NodeController.getTrash));
router.delete('/trash', asyncHandler(NodeController.emptyTrash));
router.post('/:id/restore-trash', asyncHandler(NodeController.restoreNodeFromTrash));
router.delete('/:id/permanent', asyncHandler(NodeController.permanentDeleteNode));

// Standard CRUD
router.get('/', asyncHandler(NodeController.getNodes));
router.post('/', asyncHandler(NodeController.createNode));
router.get('/:id', asyncHandler(NodeController.getNode));
router.put('/:id', asyncHandler(NodeController.updateNode));
router.delete('/:id', asyncHandler(NodeController.deleteNode));

// Complex Actions
router.post('/:id/move', asyncHandler(NodeController.moveNode));
router.post('/:id/duplicate', asyncHandler(NodeController.duplicateNode));
router.post('/:id/archive', asyncHandler(NodeController.archiveNode));
router.post('/:id/restore', asyncHandler(NodeController.restoreNode));
router.post('/:id/favorite', asyncHandler(NodeController.favoriteNode));
router.post('/:id/unfavorite', asyncHandler(NodeController.unfavoriteNode));
router.get('/:id/history', asyncHandler(NodeController.getNodeHistory));

export default router;
