import {
    Blog,
    BlogCreate,
    BlogUpdate,
    BlogCreateSchema,
    BlogUpdateSchema,
} from '@/schemas/blog.schema';
import { prismaPostgres } from '@/../prisma';

class BlogModel {
    // Convert DB nulls -> undefined only for optional fields
    private mapNulls(b: any): Blog {
        return {
            ...b,
            image: b.image ?? undefined,
            tags: b.tags ?? undefined,
            deletedAt: b.deletedAt ?? undefined,
            // include author if loaded by query (it will be whatever prisma returns)
            author: b.author ?? undefined,
        };
    }

    async GetAllBlogs(): Promise<Blog[]> {
        try {
            // include author if you want relation loaded; remove include if not desired
            const blogs = await prismaPostgres.blog.findMany({
                include: { author: true },
            });
            return blogs.map((b) => this.mapNulls(b));
        } catch (error) {
            console.error('Error fetching all blogs:', error);
            throw new Error('Failed to fetch blogs');
        }
    }

    async GetBlog(id: string): Promise<Blog | null> {
        try {
            const blog = await prismaPostgres.blog.findUnique({
                where: { id },
                include: { author: true },
            });
            return blog ? this.mapNulls(blog) : null;
        } catch (error) {
            console.error(`Error fetching blog with id ${id}:`, error);
            throw new Error('Failed to fetch blog');
        }
    }

    // Accept Create-type input (no id/timestamps)
    async CreateBlog(blog: BlogCreate): Promise<Blog> {
        try {
            const parsed = BlogCreateSchema.parse(blog);

            const newBlog = await prismaPostgres.blog.create({
                data: parsed,
                include: { author: true },
            });

            return this.mapNulls(newBlog);
        } catch (error) {
            console.error('Error creating blog:', error);
            // surface Prisma error message when available
            if (error instanceof Error) throw new Error(error.message);
            throw new Error('Failed to create blog');
        }
    }

    // Accept Update-type input; requires id
    async UpdateBlog(blog: BlogUpdate & { id: string }): Promise<Blog> {
        try {
            if (!blog.id) throw new Error('Blog ID is required for update');

            // Validate update payload (partial)
            const parsed = BlogUpdateSchema.parse(blog);

            // Do not allow updating id or timestamps
            const { id, ...data } = parsed as any;

            const updatedBlog = await prismaPostgres.blog.update({
                where: { id: blog.id },
                data,
                include: { author: true },
            });

            return this.mapNulls(updatedBlog);
        } catch (error) {
            console.error(`Error updating blog with id ${blog.id}:`, error);
            if (error instanceof Error) throw new Error(error.message);
            throw new Error('Failed to update blog');
        }
    }

    // Soft delete helper (optional): sets deletedAt instead of hard delete
    async SoftDeleteBlog(id: string): Promise<boolean> {
        try {
            await prismaPostgres.blog.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return true;
        } catch (error) {
            console.error(`Error soft-deleting blog with id ${id}:`, error);
            throw new Error('Failed to soft-delete blog');
        }
    }

    async DeleteBlog(id: string): Promise<boolean> {
        try {
            await prismaPostgres.blog.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            console.error(`Error deleting blog with id ${id}:`, error);
            throw new Error('Failed to delete blog');
        }
    }
}

export default new BlogModel();
