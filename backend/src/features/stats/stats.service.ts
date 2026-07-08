import prisma from '../../common/utils/prisma';

export class StatsService {
  static async getStats() {
    // 1. Total Nodes (not deleted)
    const totalNodes = await prisma.node.count({
      where: { isDeleted: false },
    });

    // 2. Favorite Nodes (not deleted)
    const favoriteNodes = await prisma.node.count({
      where: { isDeleted: false, isFavorite: true },
    });

    // 3. Attachments Aggregation
    const attachments = await prisma.attachment.findMany({
      select: { size: true, mimeType: true }
    });

    let totalAttachments = 0;
    let imagesCount = 0;
    let videosCount = 0;
    let documentsCount = 0;
    let storageUsed = 0;

    for (const att of attachments) {
      totalAttachments++;
      storageUsed += att.size;
      if (att.mimeType.startsWith('image/')) {
        imagesCount++;
      } else if (att.mimeType.startsWith('video/')) {
        videosCount++;
      } else if (
        att.mimeType.includes('pdf') || 
        att.mimeType.includes('document') || 
        att.mimeType.includes('msword') || 
        att.mimeType.includes('presentation') || 
        att.mimeType.includes('excel') ||
        att.mimeType.startsWith('text/')
      ) {
        documentsCount++;
      }
    }

    // 4. Recent Global Activity
    const recentActivity = await prisma.history.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        node: {
          select: { id: true, title: true }
        }
      }
    });

    return {
      totalNodes,
      favoriteNodes,
      attachments: totalAttachments,
      images: imagesCount,
      videos: videosCount,
      documents: documentsCount,
      storageUsed,
      recentActivity,
    };
  }
}
