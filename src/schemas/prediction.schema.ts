import { z } from 'zod';

export const PricePredictionCacheSchema = z
    .object({
        id: z.uuid().optional(),
        title: z
            .string()
            .max(200, 'Title cannot exceed 200 characters')
            .optional(),
        params: z.string().optional(),
        price: z.number().min(0, 'Price must be non-negative'),
        timestamp: z.date(),
        expirytime: z.date(),
    })
    .refine((data) => data.expirytime > data.timestamp, {
        message: 'Expiry time must be greater than timestamp',
        path: ['expirytime'], // highlight the expirytime field in errors
    });

export type PricePredictionCache = z.infer<
    typeof PricePredictionCacheSchema
>;
