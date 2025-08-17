import { PrismaClient as PostgresClient } from '.prisma/postgres';
import { PrismaClient as MongoClient } from '.prisma/mongo';

export const prismaPostgres = new PostgresClient();
export const prismaMongo = new MongoClient();
