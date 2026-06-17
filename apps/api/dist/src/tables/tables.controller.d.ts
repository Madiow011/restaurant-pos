import { TablesService } from './tables.service';
import { TableStatus } from '../generated/prisma/client';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    findAll(): import("../generated/prisma/client").Prisma.PrismaPromise<({
        orders: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("../generated/prisma/client").$Enums.OrderStatus;
            orderNumber: string;
            subtotal: number;
            vatRate: number;
            vatAmount: number;
            totalAmount: number;
            paymentMethod: import("../generated/prisma/client").$Enums.PaymentMethod | null;
            paidAt: Date | null;
            note: string | null;
            tableId: number;
        }[];
    } & {
        number: number;
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        capacity: number;
        status: import("../generated/prisma/client").$Enums.TableStatus;
        posX: number | null;
        posY: number | null;
    })[]>;
    findOne(id: number): import("../generated/prisma/client").Prisma.Prisma__TableClient<{
        orders: ({
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
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("../generated/prisma/client").$Enums.OrderStatus;
            orderNumber: string;
            subtotal: number;
            vatRate: number;
            vatAmount: number;
            totalAmount: number;
            paymentMethod: import("../generated/prisma/client").$Enums.PaymentMethod | null;
            paidAt: Date | null;
            note: string | null;
            tableId: number;
        })[];
    } & {
        number: number;
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        capacity: number;
        status: import("../generated/prisma/client").$Enums.TableStatus;
        posX: number | null;
        posY: number | null;
    }, null, import("src/generated/prisma/client/runtime/client").DefaultArgs, import("../generated/prisma/client").Prisma.PrismaClientOptions>;
    updateStatus(id: number, status: TableStatus): import("../generated/prisma/client").Prisma.Prisma__TableClient<{
        number: number;
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        capacity: number;
        status: import("../generated/prisma/client").$Enums.TableStatus;
        posX: number | null;
        posY: number | null;
    }, never, import("src/generated/prisma/client/runtime/client").DefaultArgs, import("../generated/prisma/client").Prisma.PrismaClientOptions>;
}
