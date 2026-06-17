import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
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
