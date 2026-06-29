import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, CheckoutOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateOrderNumber;
    create(dto: CreateOrderDto): Promise<any>;
    findOne(id: number): any;
    addItems(orderId: number, dto: CreateOrderDto): Promise<any>;
    checkout(orderId: number, dto: CheckoutOrderDto): Promise<any>;
    cancel(orderId: number): Promise<any>;
}
