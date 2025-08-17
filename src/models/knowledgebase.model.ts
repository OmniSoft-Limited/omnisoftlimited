import { KnowledgeBaseSchema, KnowledgeBase } from '@/schemas/knowledgebase.schema';
import { prismaMongo } from '@/../prisma';

class KnowledgeBaseModel {
    // Helper to map null -> undefined
    private mapNulls(k: any): KnowledgeBase {
        return {
            ...k,
            title: k.title ?? undefined,
            content: k.content ?? undefined,
        };
    }

    async GetAllKnowledgeBases(): Promise<KnowledgeBase[]> {
        try {
            const knowledgeBases = await prismaMongo.knowledgeBase.findMany();
            return knowledgeBases.map(this.mapNulls);
        } catch (error) {
            console.error('Error fetching all knowledge bases:', error);
            throw new Error('Failed to fetch knowledge bases');
        }
    }

    async GetKnowledgeBase(id: string): Promise<KnowledgeBase | null> {
        try {
            const knowledgeBase = await prismaMongo.knowledgeBase.findUnique({
                where: { id },
            });
            return knowledgeBase ? this.mapNulls(knowledgeBase) : null;
        } catch (error) {
            console.error(`Error fetching knowledge base with id ${id}:`, error);
            throw new Error('Failed to fetch knowledge base');
        }
    }

    async CreateKnowledgeBase(knowledgeBase: KnowledgeBase): Promise<KnowledgeBase> {
        try {
            // Validate input
            const parsed = KnowledgeBaseSchema.parse(knowledgeBase);

            const newKnowledgeBase = await prismaMongo.knowledgeBase.create({
                data: parsed,
            });

            return this.mapNulls(newKnowledgeBase);
        } catch (error) {
            console.error('Error creating knowledge base:', error);
            throw new Error('Failed to create knowledge base');
        }
    }

    async UpdateKnowledgeBase(knowledgeBase: KnowledgeBase): Promise<KnowledgeBase> {
        try {
            if (!knowledgeBase.id) throw new Error('Knowledge base ID is required for update');

            // Validate input
            const parsed = KnowledgeBaseSchema.parse(knowledgeBase);

            const updatedKnowledgeBase = await prismaMongo.knowledgeBase.update({
                where: { id: parsed.id },
                data: parsed,
            });

            return this.mapNulls(updatedKnowledgeBase);
        } catch (error) {
            console.error(`Error updating knowledge base with id ${knowledgeBase.id}:`, error);
            throw new Error('Failed to update knowledge base');
        }
    }

    async DeleteKnowledgeBase(id: string): Promise<boolean> {
        try {
            await prismaMongo.knowledgeBase.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            console.error(`Error deleting knowledge base with id ${id}:`, error);
            throw new Error('Failed to delete knowledge base');
        }
    }
}

export default new KnowledgeBaseModel();