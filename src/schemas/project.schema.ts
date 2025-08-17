import { z } from 'zod';
import { TechnologyEnum } from './technologies.enum';

// Base schema that mirrors the Prisma model
export const ProjectSchema = z.object({
    id: z.string().cuid().optional(),
    title: z.string().min(1, 'Title is required'),
    image: z.string().url('Invalid image URL').optional(),
    description: z.string().min(1, 'Description is required'),
    body: z.string().min(1, 'Body is required'),
    published: z.boolean().optional(), // Prisma default false
    techstack: z.array(TechnologyEnum).optional(),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    deletedAt: z.date().nullable().optional(),
});

// Create schema: exclude auto-generated fields and relations
export const ProjectCreateSchema = ProjectSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

// Update schema: partial version of create schema for PATCH semantics
export const ProjectUpdateSchema = ProjectCreateSchema.partial();

// Types
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
