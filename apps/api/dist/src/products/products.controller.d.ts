import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(categoryId?: string): import("src/generated/prisma/client").Prisma.PrismaPromise<({
        category: {
            id: number;
            name: string;
            icon: string | null;
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        name: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        imageUrl: string | null;
        categoryId: number;
    })[]>;
    findOne(id: number): import("src/generated/prisma/client").Prisma.Prisma__ProductClient<{
        category: {
            id: number;
            name: string;
            icon: string | null;
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        name: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        imageUrl: string | null;
        categoryId: number;
    }, null, import("src/generated/prisma/client/runtime/client").DefaultArgs, import("src/generated/prisma/client").Prisma.PrismaClientOptions>;
}
