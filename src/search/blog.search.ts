import { prismaPostgres } from '@/../prisma';
import { Blog } from '@/schemas/blog.schema';

type SearchResult = {
    items: Blog[];
    total: number;
    page: number;
    totalPages: number;
};

export async function SearchBlogs(
    query: string,
    page = 1,
    limit = 20,
): Promise<SearchResult> {
    if (!query || !query.trim()) {
        return { items: [], total: 0, page, totalPages: 0 };
    }

    const q = query.trim();
    const pageNum = Math.max(1, Math.trunc(page || 1));
    const take = Math.min(100, Math.max(1, Math.trunc(limit || 20)));
    const skip = (pageNum - 1) * take;

    try {
        // Build Prisma "where" clause:
        // - exclude soft-deleted (deletedAt IS NULL)
        // - match title OR description (case-insensitive contains)
        // - OR match tags array containing the exact tag (prisma 'has')
        const where: any = {
            deletedAt: null,
            AND: [],
        };

        const or: any[] = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            // tags is an enum[] — `has` requires exact value; keeps tag search fast
            { tags: { has: q } },
        ];

        where.AND.push({ OR: or });

        // run both queries in parallel: items + count
        const [items, total] = await Promise.all([
            prismaPostgres.blog.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            prismaPostgres.blog.count({ where }),
        ]);

        // map DB results to Blog type (convert any null -> undefined)
        const mapped: Blog[] = items.map((b: any) => ({
            id: b.id,
            title: b.title ?? undefined,
            image: b.image ?? undefined,
            description: b.description ?? undefined,
            body: b.body ?? undefined,
            published:
                typeof b.published === 'boolean' ? b.published : undefined,
            tags: b.tags ?? undefined,
            authorId: b.authorId ?? undefined,
            createdAt: b.createdAt ?? undefined,
            updatedAt: b.updatedAt ?? undefined,
            deletedAt: b.deletedAt ?? undefined,
        }));

        const totalPages = Math.max(0, Math.ceil(Number(total || 0) / take));

        return {
            items: mapped,
            total: Number(total || 0),
            page: pageNum,
            totalPages,
        };
    } catch (err) {
        console.error('Postgres search error:', err);
        throw new Error('Failed to search blogs (Postgres)');
    }
}


/**
 * Full-text search using Postgres tsvector (document column) + plainto_tsquery
 * - q: search string
 * - page, limit: pagination (offset-based). For very large datasets consider keyset pagination.
 */
export async function SearchBlogsFTS(
    q: string,
    page = 1,
    limit = 20,
): Promise<SearchResult> {
    if (!q || !q.trim()) {
        return { items: [], total: 0, page, totalPages: 0 };
    }

    const query = q.trim();
    const pageNum = Math.max(1, Math.trunc(page || 1));
    const take = Math.min(100, Math.max(1, Math.trunc(limit || 20)));
    const offset = (pageNum - 1) * take;

    try {
        // 1) Get paginated, ranked rows
        // Use plainto_tsquery for simple, safe parsing of the user query.
        const rows = (await prismaPostgres.$queryRaw`
      SELECT
        "id",
        "title",
        "description",
        "body",
        "image",
        "tags",
        "authorId",
        "createdAt",
        "updatedAt",
        "deletedAt",
        ts_rank("document", plainto_tsquery('english', ${query})) AS rank
      FROM "Blog"
      WHERE "document" @@ plainto_tsquery('english', ${query})
        AND "deletedAt" IS NULL
      ORDER BY rank DESC, "createdAt" DESC
      LIMIT ${take} OFFSET ${offset};
    `) as Array<any>;

        // 2) Get total count (for pagination metadata)
        const countRes = (await prismaPostgres.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM "Blog"
      WHERE "document" @@ plainto_tsquery('english', ${query})
        AND "deletedAt" IS NULL;
    `) as Array<{ total: number }>;

        const total = Number(countRes?.[0]?.total ?? 0);
        const totalPages = Math.max(0, Math.ceil(total / take));

        // 3) Map DB rows -> Blog[] (convert nulls to undefined, parse dates)
        const items: Blog[] = rows.map((r: any) => ({
            id: r.id,
            title: r.title ?? undefined,
            image: r.image ?? undefined,
            description: r.description ?? undefined,
            body: r.body ?? undefined,
            published:
                typeof r.published === 'boolean' ? r.published : undefined,
            tags: r.tags ?? undefined, // will be returned as text[] by Postgres
            authorId: r.authorId ?? undefined,
            createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
            updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
            deletedAt: r.deletedAt ? new Date(r.deletedAt) : undefined,
            // optional: include rank if you want to surface it
            // rank: typeof r.rank === 'number' ? r.rank : undefined,
        }));

        return { items, total, page: pageNum, totalPages };
    } catch (err) {
        console.error('searchBlogsFTS error:', err);
        throw new Error('Failed to perform full-text search');
    }
}
