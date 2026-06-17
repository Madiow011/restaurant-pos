import { OrdersService } from './orders.service';
import { CreateOrderDto, CheckoutOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<{
        orderItems: ({
            product: {
                id: number;
                name: string;
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                imageUrl: string | null;
                categoryId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            subtotal: number;
            note: string | null;
            productId: number;
            quantity: number;
            unitPrice: number;
            orderId: number;
        })[];
        table: {
            number: number;
            id: number;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            capacity: number;
            status: import("src/generated/prisma/client").$Enums.TableStatus;
            posX: number | null;
            posY: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("src/generated/prisma/client").$Enums.OrderStatus;
        orderNumber: string;
        subtotal: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        paymentMethod: import("src/generated/prisma/client").$Enums.PaymentMethod | null;
        paidAt: Date | null;
        note: string | null;
        tableId: number;
    }>;
    findOne(id: number): import("src/generated/prisma/client").Prisma.Prisma__OrderClient<{
        orderItems: ({
            product: {
                id: number;
                name: string;
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                imageUrl: string | null;
                categoryId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            subtotal: number;
            note: string | null;
            productId: number;
            quantity: number;
            unitPrice: number;
            orderId: number;
        })[];
        table: {
            number: number;
            id: number;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            capacity: number;
            status: import("src/generated/prisma/client").$Enums.TableStatus;
            posX: number | null;
            posY: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("src/generated/prisma/client").$Enums.OrderStatus;
        orderNumber: string;
        subtotal: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        paymentMethod: import("src/generated/prisma/client").$Enums.PaymentMethod | null;
        paidAt: Date | null;
        note: string | null;
        tableId: number;
    }, null, import("src/generated/prisma/client/runtime/client").DefaultArgs, import("src/generated/prisma/client").Prisma.PrismaClientOptions>;
    addItems(id: number, dto: CreateOrderDto): Promise<{
        orderItems: ({
            product: {
                id: number;
                name: string;
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                imageUrl: string | null;
                categoryId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            subtotal: number;
            note: string | null;
            productId: number;
            quantity: number;
            unitPrice: number;
            orderId: number;
        })[];
        table: {
            number: number;
            id: number;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            capacity: number;
            status: import("src/generated/prisma/client").$Enums.TableStatus;
            posX: number | null;
            posY: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("src/generated/prisma/client").$Enums.OrderStatus;
        orderNumber: string;
        subtotal: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        paymentMethod: import("src/generated/prisma/client").$Enums.PaymentMethod | null;
        paidAt: Date | null;
        note: string | null;
        tableId: number;
    }>;
    checkout(id: number, dto: CheckoutOrderDto): Promise<{
        orderItems: ({
            product: {
                id: number;
                name: string;
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                imageUrl: string | null;
                categoryId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            subtotal: number;
            note: string | null;
            productId: number;
            quantity: number;
            unitPrice: number;
            orderId: number;
        })[];
        table: {
            number: number;
            id: number;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            capacity: number;
            status: import("src/generated/prisma/client").$Enums.TableStatus;
            posX: number | null;
            posY: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("src/generated/prisma/client").$Enums.OrderStatus;
        orderNumber: string;
        subtotal: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        paymentMethod: import("src/generated/prisma/client").$Enums.PaymentMethod | null;
        paidAt: Date | null;
        note: string | null;
        tableId: number;
    }>;
    cancel(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("src/generated/prisma/client").$Enums.OrderStatus;
        orderNumber: string;
        subtotal: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        paymentMethod: import("src/generated/prisma/client").$Enums.PaymentMethod | null;
        paidAt: Date | null;
        note: string | null;
        tableId: number;
    }>;
}
