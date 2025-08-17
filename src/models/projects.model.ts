import {
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectCreateSchema,
    ProjectUpdateSchema,
} from '@/schemas/project.schema';
import { prismaPostgres } from '@/../prisma';

type ListOptions = {
    page?: number;
    limit?: number;
    published?: boolean;
    tag?: string; // should be one of TechnologyEnum string values
    search?: string;
};

class ProjectModel {
    // Convert DB nulls -> undefined only for optional fields
    private mapNulls(p: any): Project {
        return {
            ...p,
            image: p.image ?? undefined,
            techstack: p.techstack ?? undefined,
            deletedAt: p.deletedAt ?? undefined,
        };
    }

    /**
     * Get list of projects with optional pagination & filters.
     * - default: page=1, limit=20
     * - filters: published, tag (techstack has), search (title/description)
     */
    async GetAllProjects(options: ListOptions = {}): Promise<Project[]> {
        try {
            const page = Math.max(1, options.page ?? 1);
            const limit = Math.min(100, Math.max(1, options.limit ?? 20));
            const skip = (page - 1) * limit;

            const where: any = {
                // Exclude soft-deleted by default
                deletedAt: null,
            };

            if (typeof options.published === 'boolean') {
                where.published = options.published;
            }

            if (options.tag) {
                // For Postgres enum[] or string[] fields Prisma supports { has: value }
                where.techstack = { has: options.tag };
            }

            if (options.search) {
                where.OR = [
                    {
                        title: {
                            contains: options.search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: options.search,
                            mode: 'insensitive',
                        },
                    },
                ];
            }

            const projects = await prismaPostgres.project.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            });

            return projects.map((p) => this.mapNulls(p));
        } catch (error) {
            console.error('Error fetching all projects:', error);
            throw new Error('Failed to fetch projects');
        }
    }

    /**
     * Get single project by id. Returns null if not found or soft-deleted.
     */
    async GetProject(id: string): Promise<Project | null> {
        try {
            const project = await prismaPostgres.project.findUnique({
                where: { id },
            });

            if (!project) return null;
            if (project.deletedAt) {
                // Optionally remove from DB or just return null. We'll return null.
                return null;
            }

            return this.mapNulls(project);
        } catch (error) {
            console.error(`Error fetching project with id ${id}:`, error);
            throw new Error('Failed to fetch project');
        }
    }

    /**
     * Create a project. Uses ProjectCreateSchema (no id/timestamps allowed).
     */
    async CreateProject(project: ProjectCreate): Promise<Project> {
        try {
            const parsed = ProjectCreateSchema.parse(project);

            const newProject = await prismaPostgres.project.create({
                data: parsed,
            });

            return this.mapNulls(newProject);
        } catch (error) {
            console.error('Error creating project:', error);
            if (error instanceof Error) throw new Error(error.message);
            throw new Error('Failed to create project');
        }
    }

    /**
     * Update a project. Requires { id } and accepts partial update fields.
     */
    async UpdateProject(
        project: ProjectUpdate & { id: string },
    ): Promise<Project> {
        try {
            if (!project.id)
                throw new Error('Project ID is required for update');

            const parsed = ProjectUpdateSchema.parse(project);

            // remove id/timestamps from data if present
            const { id, ...data } = parsed as any;

            const updatedProject = await prismaPostgres.project.update({
                where: { id: project.id },
                data,
            });

            return this.mapNulls(updatedProject);
        } catch (error) {
            console.error(
                `Error updating project with id ${project.id}:`,
                error,
            );
            if (error instanceof Error) throw new Error(error.message);
            throw new Error('Failed to update project');
        }
    }

    /**
     * Soft delete: set deletedAt timestamp.
     */
    async SoftDeleteProject(id: string): Promise<boolean> {
        try {
            await prismaPostgres.project.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return true;
        } catch (error) {
            console.error(`Error soft-deleting project with id ${id}:`, error);
            throw new Error('Failed to soft-delete project');
        }
    }

    /**
     * Hard delete from DB.
     */
    async DeleteProject(id: string): Promise<boolean> {
        try {
            await prismaPostgres.project.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            console.error(`Error deleting project with id ${id}:`, error);
            throw new Error('Failed to delete project');
        }
    }
}

export default new ProjectModel();
