import { z } from 'zod';
import { TechnologyEnum } from './technologies.enum';

// Base schema that mirrors the Prisma model
export const BlogSchema = z.object({
    id: z.cuid().optional(),
    title: z.string().min(1, 'Title is required'),
    image: z.url('Invalid image URL').optional(),
    description: z.string().min(1, 'Description is required'),
    body: z.string().min(1, 'Body is required'),
    published: z.boolean().optional(), // Prisma default false
    authorId: z.string().cuid(),
    tags: z.array(TechnologyEnum).optional(),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    deletedAt: z.date().nullable().optional(),
});

// Create schema: exclude auto-generated fields and relations
export const BlogCreateSchema = BlogSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

// Update schema: partial version of create schema for PATCH semantics
export const BlogUpdateSchema = BlogCreateSchema.partial();

// Types
export type Blog = z.infer<typeof BlogSchema>;
export type BlogCreate = z.infer<typeof BlogCreateSchema>;
export type BlogUpdate = z.infer<typeof BlogUpdateSchema>;
