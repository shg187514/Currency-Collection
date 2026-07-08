import prisma from '../../common/utils/prisma';

export class NodeService {
  static async createNode(data: { title: string; content?: string; parentId?: string | null }) {
    return await prisma.node.create({
      data: {
        title: data.title,
        content: data.content,
        parentId: data.parentId,
        histories: {
          create: { action: 'CREATED', changes: JSON.stringify(data) },
        },
      },
    });
  }

  static async getNode(id: string) {
    const node = await prisma.node.findUnique({
      where: { id },
      include: {
        children: {
          where: { isArchived: false },
        },
        tags: { orderBy: { name: 'asc' } },
        attachments: true,
      },
    });
    if (!node) throw { statusCode: 404, message: 'Node not found' };
    return node;
  }

  static async getNodes() {
    return await prisma.node.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { tags: true, attachments: true }
    });
  }

  static async getTree() {
    // Fetch top-level nodes and include all their nested children recursively?
    // Prisma does not support infinite deep include. We fetch all unarchived and undeleted nodes and build the tree in memory.
    const nodes = await prisma.node.findMany({
      where: { isArchived: false, isDeleted: false },
      include: { attachments: true, tags: { orderBy: { name: 'asc' } } },
      orderBy: { order: 'asc' },
    });

    const nodeMap = new Map<string, any>();
    const roots: any[] = [];

    nodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    nodes.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId).children.push(nodeMap.get(node.id));
      } else {
        roots.push(nodeMap.get(node.id));
      }
    });

    return roots;
  }

  static async updateNode(id: string, data: { title?: string; description?: string | null; content?: string | null; tagIds?: string[] }) {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    const updateData: any = {
      title: data.title,
      description: data.description,
      content: data.content,
      histories: {
        create: { action: 'UPDATED', changes: JSON.stringify(data) },
      },
    };

    if (data.tagIds !== undefined) {
      updateData.tags = {
        set: data.tagIds.map(tagId => ({ id: tagId })),
      };
    }

    return await prisma.node.update({
      where: { id },
      data: updateData,
    });
  }

  static async getDescendantIds(id: string): Promise<string[]> {
    const children = await prisma.node.findMany({ where: { parentId: id }, select: { id: true } });
    let descendantIds = children.map(c => c.id);
    for (const child of children) {
      const childDescendants = await NodeService.getDescendantIds(child.id);
      descendantIds = descendantIds.concat(childDescendants);
    }
    return descendantIds;
  }

  static async deleteNode(id: string, deleteDescendants: boolean = false) {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    return await prisma.$transaction(async (tx) => {
      if (deleteDescendants) {
        const descendantIds = await NodeService.getDescendantIds(id);
        const allIds = [id, ...descendantIds];
        
        await tx.node.updateMany({
          where: { id: { in: allIds } },
          data: { isDeleted: true },
        });

        await Promise.all(
          allIds.map(targetId => 
            tx.history.create({ data: { action: 'DELETED', nodeId: targetId } })
          )
        );
      } else {
        const children = await tx.node.findMany({ where: { parentId: id } });
        if (children.length > 0) {
          await tx.node.updateMany({
            where: { parentId: id },
            data: { parentId: node.parentId },
          });
          
          await Promise.all(
            children.map(child =>
              tx.history.create({
                data: { action: 'MOVED', changes: JSON.stringify({ newParentId: node.parentId }), nodeId: child.id },
              })
            )
          );
        }

        await tx.node.update({
          where: { id },
          data: {
            isDeleted: true,
            histories: { create: { action: 'DELETED' } },
          },
        });
      }
    });
  }

  static async permanentDeleteNode(id: string) {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    return await prisma.node.delete({
      where: { id },
    });
  }

  static async restoreNodeFromTrash(id: string) {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    return await prisma.node.update({
      where: { id },
      data: {
        isDeleted: false,
        histories: {
          create: { action: 'RESTORED_FROM_TRASH' },
        },
      },
    });
  }

  static async getTrash() {
    return await prisma.node.findMany({
      where: { isDeleted: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async emptyTrash() {
    return await prisma.node.deleteMany({
      where: { isDeleted: true },
    });
  }

  static async moveNode(id: string, newParentId: string | null, siblingIds: string[] = []) {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    if (id === newParentId) {
      throw { statusCode: 400, message: 'Cannot move a node into itself' };
    }

    // Use a transaction to update the node's parent and all sibling orders
    return await prisma.$transaction(async (tx) => {
      // 1. Move the node
      const movedNode = await tx.node.update({
        where: { id },
        data: {
          parentId: newParentId,
          histories: {
            create: { action: 'MOVED', changes: JSON.stringify({ newParentId }) },
          },
        },
      });

      // 2. Update sibling orders if provided
      if (siblingIds.length > 0) {
        for (let i = 0; i < siblingIds.length; i++) {
          await tx.node.update({
            where: { id: siblingIds[i] },
            data: { order: i },
          });
        }
      }

      return movedNode;
    });
  }

  static async duplicateNode(id: string) {
    // Helper to deeply copy a node and its descendants
    const copyNodeRecursive = async (sourceId: string, parentId: string | null = null): Promise<any> => {
      const source = await prisma.node.findUnique({
        where: { id: sourceId },
        include: { children: true },
      });

      if (!source) throw { statusCode: 404, message: 'Source node not found' };

      const newTitle = parentId === null ? `${source.title} (Copy)` : source.title;

      const newNode = await prisma.node.create({
        data: {
          title: newTitle,
          content: source.content,
          parentId,
          histories: {
            create: { action: 'DUPLICATED_FROM', changes: JSON.stringify({ originalId: sourceId }) },
          },
        },
      });

      for (const child of source.children) {
        await copyNodeRecursive(child.id, newNode.id);
      }

      return newNode;
    };

    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    const copiedRoot = await copyNodeRecursive(id, node.parentId);
    return copiedRoot;
  }

  static async setArchivedStatus(id: string, isArchived: boolean) {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    return await prisma.node.update({
      where: { id },
      data: {
        isArchived,
        histories: {
          create: { action: isArchived ? 'ARCHIVED' : 'RESTORED' },
        },
      },
    });
  }

  static async toggleFavorite(id: string, isFavorite: boolean) {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    return await prisma.node.update({
      where: { id },
      data: {
        isFavorite,
        histories: {
          create: { action: isFavorite ? 'FAVORITED' : 'UNFAVORITED' },
        },
      },
    });
  }

  static async getNodeHistory(id: string) {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) throw { statusCode: 404, message: 'Node not found' };

    return await prisma.history.findMany({
      where: { nodeId: id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
