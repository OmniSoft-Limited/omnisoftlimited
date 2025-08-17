import { prismaMongo } from '@/../prisma';
import { PricePredictionCache } from '@/schemas/prediction.schema';

type SearchResult = {
    items: PricePredictionCache[];
    total: number;
    page: number;
    totalPages: number;
};

export async function SearchPredictions(
    query: string,
    page = 1,
    limit = 20,
): Promise<SearchResult> {
    if (!query || !query.trim()) {
        return { items: [], total: 0, page, totalPages: 0 };
    }

    const q = query.trim();
    const pageNum = Math.max(1, Math.trunc(page || 1));
    const take = Math.max(1, Math.trunc(limit || 20));
    const skip = (pageNum - 1) * take;
    const now = new Date();

    try {
        // 1) Remove expired entries (cleanup)
        try {
            await prismaMongo.pricePredictionCache.deleteMany({
                where: { expirytime: { lte: now } },
            });
        } catch (cleanupErr) {
            // Non-fatal: log and continue
            console.warn('Failed to cleanup expired predictions:', cleanupErr);
        }

        // 2) Try Mongo text search via raw command (fast & ranked). Requires text index on title.
        //    If it fails (e.g., index missing), we'll fallback to a Prisma-based 'contains' search.
        const cmd: any = {
            find: 'pricePredictionCache', // confirm collection name if different
            filter: { $text: { $search: q }, expirytime: { $gt: now } },
            projection: {
                score: { $meta: 'textScore' },
                title: 1,
                params: 1,
                price: 1,
                timestamp: 1,
                expirytime: 1,
                // _id included by default
            },
            sort: { score: { $meta: 'textScore' }, timestamp: -1 },
            skip,
            limit: take,
        };

        let docs: any[] = [];
        let total = 0;

        try {
            const raw = (await prismaMongo.$runCommandRaw(cmd)) as any;

            // defensive extraction of docs
            if (raw?.cursor && Array.isArray(raw.cursor.firstBatch)) {
                docs = raw.cursor.firstBatch;
            } else if (Array.isArray(raw?.firstBatch)) {
                docs = raw.firstBatch;
            } else if (Array.isArray(raw)) {
                docs = raw;
            } else {
                docs = [];
            }

            // get total count for this text search
            const countRaw = (await prismaMongo.$runCommandRaw({
                count: 'pricePredictionCache',
                query: { $text: { $search: q }, expirytime: { $gt: now } },
            })) as any;
            total = Number(countRaw?.n ?? 0) || 0;
        } catch (rawErr) {
            // Fallback: if text index isn't available or $runCommandRaw failed, use Prisma .findMany with title contains
            console.warn(
                'Raw text search failed, falling back to Prisma contains search:',
                rawErr,
            );

            // Prisma-based search (case-insensitive contains)
            const where: any = {
                title: { contains: q, mode: 'insensitive' },
                expirytime: { gt: now },
            };

            const [items, count] = await Promise.all([
                prismaMongo.pricePredictionCache.findMany({
                    where,
                    skip,
                    take,
                    orderBy: { timestamp: 'desc' },
                }),
                prismaMongo.pricePredictionCache.count({ where }),
            ]);

            docs = items as any[];
            total = Number(count ?? 0) || 0;
        }

        // 3) Map docs to PricePredictionCache type (convert _id to id and parse dates)
        const items: PricePredictionCache[] = docs.map((d: any) => {
            const rawId = d._id ?? d.id;
            const id =
                rawId &&
                typeof rawId === 'object' &&
                typeof rawId.toString === 'function'
                    ? rawId.toString()
                    : rawId
                    ? String(rawId)
                    : undefined;

            return {
                id,
                title: d.title ?? undefined,
                params: d.params ?? undefined,
                price:
                    typeof d.price === 'number'
                        ? d.price
                        : Number(d.price ?? 0),
                timestamp: d.timestamp ? new Date(d.timestamp) : undefined,
                expirytime: d.expirytime ? new Date(d.expirytime) : undefined,
            } as PricePredictionCache;
        });

        const totalPages = Math.max(0, Math.ceil(total / take));
        return { items, total, page: pageNum, totalPages };
    } catch (err) {
        console.error('searchPredictions error:', err);
        throw new Error('Failed to search price predictions');
    }
}
