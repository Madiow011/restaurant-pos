import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(categoryId?: string): any;
    findOne(id: number): any;
    create(body: {
        name: string;
        price: number;
        categoryId: number;
        description?: string;
        sortOrder?: number;
    }): any;
    update(id: number, body: any): Promise<any>;
    remove(id: number): Promise<any>;
    hardDelete(id: number): Promise<any>;
}
