import { z } from "zod";

export const RatingSchema = z.object({
    id: z.uuid().optional(), // Prisma default uuid
    name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
    ip: z.string().optional(), // ensures valid IPv4
    email: z.email('Invalid email format').optional(),
    comment: z.string().min(1, 'Comment cannot be empty').max(500).optional(),
    rating: z.number().int().min(1).max(5).default(5), // restrict rating between 1–5
});

export type Rating = z.infer<typeof RatingSchema>;