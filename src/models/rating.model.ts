import { RatingSchema, Rating } from '@/schemas/rating.schema';
import { prismaMongo } from '@/../prisma';

class RatingModel {
    // Helper to map null -> undefined
    private mapNulls(r: any): Rating {
        return {
            ...r,
            name: r.name ?? undefined,
            ip: r.ip ?? undefined,
            email: r.email ?? undefined,
            comment: r.comment ?? undefined,
        };
    }

    async GetAllRatings(): Promise<Rating[]> {
        try {
            const ratings = await prismaMongo.rating.findMany();
            return ratings.map(this.mapNulls);
        } catch (error) {
            console.error('Error fetching all ratings:', error);
            throw new Error('Failed to fetch ratings');
        }
    }

    async GetRating(id: string): Promise<Rating | null> {
        try {
            const rating = await prismaMongo.rating.findUnique({
                where: { id },
            });
            return rating ? this.mapNulls(rating) : null;
        } catch (error) {
            console.error(`Error fetching rating with id ${id}:`, error);
            throw new Error('Failed to fetch rating');
        }
    }

    async CreateRating(rating: Rating): Promise<Rating> {
        try {
            // Validate input
            const parsed = RatingSchema.parse(rating);

            const newRating = await prismaMongo.rating.create({
                data: parsed,
            });

            return this.mapNulls(newRating);
        } catch (error) {
            console.error('Error creating rating:', error);
            throw new Error('Failed to create rating');
        }
    }

    async UpdateRating(rating: Rating): Promise<Rating> {
        try {
            if (!rating.id) throw new Error('Rating ID is required for update');

            // Validate input
            const parsed = RatingSchema.parse(rating);

            const updatedRating = await prismaMongo.rating.update({
                where: { id: parsed.id },
                data: parsed,
            });

            return this.mapNulls(updatedRating);
        } catch (error) {
            console.error(`Error updating rating with id ${rating.id}:`, error);
            throw new Error('Failed to update rating');
        }
    }

    async DeleteRating(id: string): Promise<boolean> {
        try {
            await prismaMongo.rating.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            console.error(`Error deleting rating with id ${id}:`, error);
            throw new Error('Failed to delete rating');
        }
    }
}

export default new RatingModel();
