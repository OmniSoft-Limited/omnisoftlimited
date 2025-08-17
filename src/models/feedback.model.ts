import { Feedback, FeedbackSchema } from "@/schemas/feedback.schema";
import { prismaMongo } from "@/../prisma";

class FeedbackModel {
    // Helper to map null -> undefined
    private mapNulls(f: any): Feedback {
        return {
            ...f,
            name: f.name ?? undefined,
            designation: f.designation ?? undefined,
            comment: f.comment ?? undefined,
            project_link: f.project_link ?? undefined,
        };
    }

    async GetAllFeedback(): Promise<Feedback[]> {
        try {
            const feedback = await prismaMongo.feedback.findMany();
            return feedback.map(this.mapNulls);
        } catch (error) {
            console.error('Error fetching all feedback:', error);
            throw new Error('Failed to fetch feedback');
        }
    }

    async GetFeedback(id: string): Promise<Feedback | null> {
        try {
            const feedback = await prismaMongo.feedback.findUnique({
                where: { id },
            });
            return feedback ? this.mapNulls(feedback) : null;
        } catch (error) {
            console.error(`Error fetching feedback with id ${id}:`, error);
            throw new Error('Failed to fetch feedback');
        }
    }

    async CreateFeedback(feedback: Feedback): Promise<Feedback> {
        try {
            // Validate input
            const parsed = FeedbackSchema.parse(feedback);

            const newFeedback = await prismaMongo.feedback.create({
                data: parsed,
            });

            return this.mapNulls(newFeedback);
        } catch (error) {
            console.error('Error creating feedback:', error);
            throw new Error('Failed to create feedback');
        }
    }

    async UpdateFeedback(feedback: Feedback): Promise<Feedback> {
        try {
            if (!feedback.id) throw new Error('Feedback ID is required for update');

            // Validate input
            const parsed = FeedbackSchema.parse(feedback);

            const updatedFeedback = await prismaMongo.feedback.update({
                where: { id: parsed.id },
                data: parsed,
            });

            return this.mapNulls(updatedFeedback);
        } catch (error) {
            console.error(`Error updating feedback with id ${feedback.id}:`, error);
            throw new Error('Failed to update feedback');
        }
    }

    async DeleteFeedback(id: string): Promise<boolean> {
        try {
            await prismaMongo.feedback.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            console.error(`Error deleting feedback with id ${id}:`, error);
            throw new Error('Failed to delete feedback');
        }
    }
}

export default new FeedbackModel();