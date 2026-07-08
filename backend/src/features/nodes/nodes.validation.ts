import { z } from 'zod';

export const createNodeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    parentId: z.string().uuid('Invalid parent ID').optional().nullable(),
  }),
});

export const updateNodeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').optional(),
    description: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    tagIds: z.array(z.string()).optional(),
  }),
});

export const moveNodeSchema = z.object({
  body: z.object({
    newParentId: z.string().uuid('Invalid parent ID').nullable(),
    siblingIds: z.array(z.string().uuid()).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid node ID'),
  }),
});

export const deleteNodeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid node ID'),
  }),
  query: z.object({
    deleteDescendants: z.string().optional().transform(val => val === 'true'),
  }),
});
