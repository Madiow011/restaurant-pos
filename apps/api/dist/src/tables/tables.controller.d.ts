import { TablesService } from './tables.service';
import { TableStatus } from '../generated/prisma/client';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    findAll(): any;
    findOne(id: number): any;
    updateStatus(id: number, status: TableStatus): any;
}
