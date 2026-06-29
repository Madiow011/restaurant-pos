import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private client;
    constructor();
    get category(): any;
    get product(): any;
    get table(): any;
    get order(): any;
    get orderItem(): any;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
