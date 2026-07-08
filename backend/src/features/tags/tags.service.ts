import prisma from '../../common/utils/prisma';

export class TagsService {
  static async getTags() {
    return await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async createTag(data: { name: string; color?: string }) {
    // Check if exists
    const existing = await prisma.tag.findUnique({ where: { name: data.name } });
    if (existing) {
      throw { statusCode: 400, message: 'Tag with this name already exists' };
    }
    
    return await prisma.tag.create({
      data,
    });
  }

  static async updateTag(id: string, data: { name?: string; color?: string }) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw { statusCode: 404, message: 'Tag not found' };
    }

    if (data.name && data.name !== tag.name) {
      const existing = await prisma.tag.findUnique({ where: { name: data.name } });
      if (existing) {
        throw { statusCode: 400, message: 'Tag with this name already exists' };
      }
    }

    return await prisma.tag.update({
      where: { id },
      data,
    });
  }

  static async deleteTag(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw { statusCode: 404, message: 'Tag not found' };
    }

    return await prisma.tag.delete({
      where: { id },
    });
  }
}
