import {
    PricePredictionCacheSchema,
    PricePredictionCache,
} from '@/schemas/prediction.schema';
import { prismaMongo } from '@/../prisma';

class PredictionModel {
    private mapNulls(p: any): PricePredictionCache {
        return {
            ...p,
            title: p.title ?? undefined,
            params: p.params ?? undefined,
            price: p.price ?? undefined,
            timestamp: p.timestamp ?? undefined,
            expirytime: p.expirytime ?? undefined,
        };
    }

    // Helper to set expirytime 10 days from now
    private setExpiry(prediction: PricePredictionCache) {
        prediction.expirytime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10); // 10 days
    }

    async GetAllPredictions(): Promise<PricePredictionCache[]> {
        try {
            const predictions =
                await prismaMongo.pricePredictionCache.findMany();

            // Optional: filter out expired predictions
            const now = new Date();
            const validPredictions: PricePredictionCache[] = [];
            for (const p of predictions) {
                if (p.expirytime && p.expirytime < now) {
                    // delete expired
                    await prismaMongo.pricePredictionCache.delete({
                        where: { id: p.id },
                    });
                } else {
                    validPredictions.push(this.mapNulls(p));
                }
            }

            return validPredictions;
        } catch (error) {
            console.error('Error fetching all predictions:', error);
            throw new Error('Failed to fetch predictions');
        }
    }

    async GetPrediction(id: string): Promise<PricePredictionCache | null> {
        try {
            const prediction =
                await prismaMongo.pricePredictionCache.findUnique({
                    where: { id },
                });

            if (!prediction) return null;

            const now = new Date();
            if (prediction.expirytime && prediction.expirytime < now) {
                // expired → delete and return null
                await prismaMongo.pricePredictionCache.delete({
                    where: { id },
                });
                return null;
            }

            return this.mapNulls(prediction);
        } catch (error) {
            console.error(`Error fetching prediction with id ${id}:`, error);
            throw new Error('Failed to fetch prediction');
        }
    }

    async CreatePrediction(
        prediction: PricePredictionCache,
    ): Promise<PricePredictionCache> {
        try {
            // Set expirytime 10 days from now
            this.setExpiry(prediction);

            const parsed = PricePredictionCacheSchema.parse(prediction);

            const newPrediction = await prismaMongo.pricePredictionCache.create(
                {
                    data: parsed,
                },
            );

            return this.mapNulls(newPrediction);
        } catch (error) {
            console.error('Error creating prediction:', error);
            throw new Error('Failed to create prediction');
        }
    }

    async UpdatePrediction(
        prediction: PricePredictionCache,
    ): Promise<PricePredictionCache> {
        try {
            if (!prediction.id)
                throw new Error('Prediction ID is required for update');

            // Reset expirytime 10 days from now
            this.setExpiry(prediction);

            const parsed = PricePredictionCacheSchema.parse(prediction);

            const updatedPrediction =
                await prismaMongo.pricePredictionCache.update({
                    where: { id: parsed.id },
                    data: parsed,
                });

            return this.mapNulls(updatedPrediction);
        } catch (error) {
            console.error(
                `Error updating prediction with id ${prediction.id}:`,
                error,
            );
            throw new Error('Failed to update prediction');
        }
    }

    async DeletePrediction(id: string): Promise<boolean> {
        try {
            await prismaMongo.pricePredictionCache.delete({ where: { id } });
            return true;
        } catch (error) {
            console.error(`Error deleting prediction with id ${id}:`, error);
            throw new Error('Failed to delete prediction');
        }
    }
}

export default new PredictionModel();
