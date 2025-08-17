import { z } from 'zod';
import { DepartmentEnum, TechnologyEnum } from './technologies.enum';

// Base schema that mirrors the Prisma model
export const MemberSchema = z.object({
    id: z.cuid().optional(),
    name: z.string().min(1, 'Name is required').max(100),
    email: z.email('Invalid email'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    designation: z.string().min(1, 'Designation is required'),
    departments: z
        .array(DepartmentEnum)
        .min(1, 'At least one department is required'),
    profilepic: z.url('Invalid profile picture URL'),
    bio: z.string().max(1000, 'Bio too long'),
    facebook_link: z.string().url('Invalid Facebook link'),
    instagram_link: z.string().url('Invalid Instagram link').optional(),
    website_link: z.string().url('Invalid Website link').optional(),
    expertise: z.array(TechnologyEnum).optional(),
    blogs: z.any().optional(), // relation validated separately if needed

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    deletedAt: z.date().nullable().optional(),
});

// Create schema: exclude auto-generated fields and relations
export const MemberCreateSchema = MemberSchema.omit({
    id: true,
    blogs: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

// Update schema: make all create-fields optional for PATCH semantics
export const MemberUpdateSchema = MemberCreateSchema.partial();

// Types
export type Member = z.infer<typeof MemberSchema>;
export type MemberCreate = z.infer<typeof MemberCreateSchema>;
export type MemberUpdate = z.infer<typeof MemberUpdateSchema>;
