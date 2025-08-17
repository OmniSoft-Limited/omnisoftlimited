import { z } from 'zod';

export const RoleEnum = z.enum(['USER', 'AI']);
export type Role = z.infer<typeof RoleEnum>;

export const ChatSchema = z.object({
    id: z.uuid().optional(), // Prisma auto UUID
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message too long'),
    role: RoleEnum,
    timestamp: z.date().optional(), // Prisma defaults to now()

    // Relations: usually validated separately
    userConversation: z.any().optional(),
    aiConversation: z.any().optional(),
});

export type Chat = z.infer<typeof ChatSchema>;

export const ChatConversationSchema = z.object({
    id: z.uuid().optional(),
    userchatId: z.uuid(),
    aichatId: z.uuid(),
    timestamp: z.date().optional(),

    // Relations (optional since Prisma can resolve them separately)
    userchat: z.any().optional(),
    aichat: z.any().optional(),
});

export type ChatConversation = z.infer<typeof ChatConversationSchema>;

