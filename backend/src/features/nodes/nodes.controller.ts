import { Request, Response } from 'express';
import { NodeService } from './nodes.service';
import { createNodeSchema, updateNodeSchema, moveNodeSchema, idParamSchema, deleteNodeSchema } from './nodes.validation';

export class NodeController {
  static async createNode(req: Request, res: Response) {
    const validatedData = createNodeSchema.parse(req).body;
    const node = await NodeService.createNode(validatedData);
    res.status(201).json({ success: true, data: node });
  }

  static async getNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const node = await NodeService.getNode(id);
    res.status(200).json({ success: true, data: node });
  }

  static async getNodes(req: Request, res: Response) {
    const nodes = await NodeService.getNodes();
    res.status(200).json({ success: true, data: nodes });
  }

  static async getTree(req: Request, res: Response) {
    const tree = await NodeService.getTree();
    res.status(200).json({ success: true, data: tree });
  }

  static async updateNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const validatedData = updateNodeSchema.parse(req).body;
    const node = await NodeService.updateNode(id, validatedData);
    res.status(200).json({ success: true, data: node });
  }

  static async deleteNode(req: Request, res: Response) {
    const { params: { id }, query: { deleteDescendants } } = deleteNodeSchema.parse(req);
    await NodeService.deleteNode(id, deleteDescendants);
    res.status(204).send();
  }

  static async moveNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const { newParentId, siblingIds } = moveNodeSchema.parse(req).body;
    const node = await NodeService.moveNode(id, newParentId, siblingIds);
    res.status(200).json({ success: true, data: node });
  }

  static async duplicateNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const node = await NodeService.duplicateNode(id);
    res.status(201).json({ success: true, data: node });
  }

  static async archiveNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const node = await NodeService.setArchivedStatus(id, true);
    res.status(200).json({ success: true, data: node });
  }

  static async restoreNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const node = await NodeService.setArchivedStatus(id, false);
    res.status(200).json({ success: true, data: node });
  }

  static async favoriteNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const node = await NodeService.toggleFavorite(id, true);
    res.status(200).json({ success: true, data: node });
  }

  static async unfavoriteNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const node = await NodeService.toggleFavorite(id, false);
    res.status(200).json({ success: true, data: node });
  }

  static async getNodeHistory(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req).params;
      const history = await NodeService.getNodeHistory(id);
      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  static async getTrash(req: Request, res: Response) {
    const trash = await NodeService.getTrash();
    res.status(200).json({ success: true, data: trash });
  }

  static async emptyTrash(req: Request, res: Response) {
    await NodeService.emptyTrash();
    res.status(204).send();
  }

  static async permanentDeleteNode(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    await NodeService.permanentDeleteNode(id);
    res.status(204).send();
  }

  static async restoreNodeFromTrash(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req).params;
    const node = await NodeService.restoreNodeFromTrash(id);
    res.status(200).json({ success: true, data: node });
  }
}
