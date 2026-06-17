import { OrdersService } from './orders.service';
import { CreateOrderDto, CheckoutOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<any>;
    findOne(id: number): any;
    addItems(id: number, dto: CreateOrderDto): Promise<any>;
    checkout(id: number, dto: CheckoutOrderDto): Promise<any>;
    cancel(id: number): Promise<any>;
}
