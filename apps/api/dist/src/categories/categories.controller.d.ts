import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): any;
    findOne(id: number): any;
    create(body: {
        name: string;
        icon?: string;
        sortOrder?: number;
    }): any;
    update(id: number, body: any): Promise<any>;
    remove(id: number): Promise<any>;
}
