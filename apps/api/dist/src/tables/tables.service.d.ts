import { PrismaService } from '../prisma/prisma.service';
import { TableStatus } from '@prisma/client';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findOne(id: number): any;
    updateStatus(id: number, status: TableStatus): any;
}
