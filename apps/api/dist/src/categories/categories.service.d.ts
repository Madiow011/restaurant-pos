import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("src/generated/prisma/client").Prisma.PrismaPromise<({
        _count: {
            products: number;
        };
    } & {
        id: number;
        name: string;
        icon: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
