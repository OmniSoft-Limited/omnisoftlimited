import { z } from 'zod';

export const KnowledgeBaseSchema = z.object({
    id: z.uuid().optional(), // Prisma generates UUID
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title cannot exceed 200 characters'),
    content: z.string().min(1, 'Content is required'),
    createdAt: z.date().optional(), // default now()
    updatedAt: z.date().optional(), // auto updated by Prisma
});

export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;
