import { TablesService } from './tables.service';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    findAll(): any;
    findOne(id: number): any;
    create(body: {
        number: number;
        name?: string;
        capacity?: number;
    }): any;
    update(id: number, body: any): Promise<any>;
    remove(id: number): Promise<any>;
    updateStatus(id: number, status: string): any;
}
