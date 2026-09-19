import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findOne(id: number): any;
    create(data: {
        name: string;
        icon?: string;
        sortOrder?: number;
    }): any;
    update(id: number, data: {
        name?: string;
        icon?: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Promise<any>;
    remove(id: number): Promise<any>;
}
