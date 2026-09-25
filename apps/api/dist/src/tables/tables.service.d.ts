import { PrismaService } from '../prisma/prisma.service';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findOne(id: number): any;
    create(data: {
        number: number;
        name?: string;
        capacity?: number;
    }): any;
    update(id: number, data: {
        name?: string;
        capacity?: number;
        status?: any;
    }): Promise<any>;
    remove(id: number): Promise<any>;
    updateStatus(id: number, status: string): any;
}
