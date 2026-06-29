import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require(path.join(__dirname, '../../generated/prisma/client'));

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  constructor() {
    const dbPath = path.resolve(__dirname, '../../../prisma/dev.db');
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    this.client = new PrismaClient({ adapter });
  }

  get category() { return this.client.category; }
  get product() { return this.client.product; }
  get table() { return this.client.table; }
  get order() { return this.client.order; }
  get orderItem() { return this.client.orderItem; }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
