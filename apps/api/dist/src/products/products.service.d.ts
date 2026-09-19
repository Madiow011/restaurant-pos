import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(categoryId?: number): any;
    findOne(id: number): any;
    create(data: {
        name: string;
        price: number;
        categoryId: number;
        description?: string;
        imageUrl?: string;
        sortOrder?: number;
    }): any;
    update(id: number, data: {
        name?: string;
        price?: number;
        categoryId?: number;
        description?: string;
        isActive?: boolean;
        sortOrder?: number;
    }): Promise<any>;
    remove(id: number): Promise<any>;
    hardDelete(id: number): Promise<any>;
}
