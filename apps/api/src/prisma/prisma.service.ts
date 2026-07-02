import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  constructor() {
    // หา apiRoot โดย traverse จาก __dirname ขึ้นไปจนเจอ package.json ที่มี "name": "api"
    let apiRoot = __dirname;
    while (apiRoot !== path.dirname(apiRoot)) {
      const pkgPath = path.join(apiRoot, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.name === 'api') break;
      }
      apiRoot = path.dirname(apiRoot);
    }

    const generatedPath = path.join(apiRoot, 'src', 'generated', 'prisma', 'client');
    const dbPath = path.join(apiRoot, 'prisma', 'dev.db');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require(generatedPath);
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    this.client = new PrismaClient({ adapter });
  }

  get category() { return this.client.category; }
  get product() { return this.client.product; }
  get table() { return this.client.table; }
  get order() { return this.client.order; }
  get orderItem() { return this.client.orderItem; }

  async onModuleInit() { await this.client.$connect(); }
  async onModuleDestroy() { await this.client.$disconnect(); }
}
