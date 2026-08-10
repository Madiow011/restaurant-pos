import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  constructor() {
    // หา apiRoot จาก __dirname ขึ้นไปจนเจอ package.json name=api
    let apiRoot = __dirname;
    while (apiRoot !== path.dirname(apiRoot)) {
      const pkgPath = path.join(apiRoot, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          if (pkg.name === 'api') break;
        } catch {}
      }
      apiRoot = path.dirname(apiRoot);
    }

    // ใน packaged: resources/apps/api/dist/src/prisma → apiRoot = resources/apps/api
    // generated อาจอยู่ใน dist/src/generated หรือ src/generated ขึ้นอยู่กับ extraResource
    const candidates = [
      path.join(apiRoot, 'dist', 'src', 'generated', 'prisma', 'client'),
      path.join(apiRoot, 'src', 'generated', 'prisma', 'client'),
      path.join(apiRoot, 'generated', 'prisma', 'client'),
    ];

    let generatedPath = candidates[0];
    for (const p of candidates) {
      if (fs.existsSync(p)) { generatedPath = p; break; }
    }

    const dbPath = path.join(apiRoot, 'prisma', 'dev.db');

    console.log('[Prisma] apiRoot:', apiRoot);
    console.log('[Prisma] generatedPath:', generatedPath, 'exists:', fs.existsSync(generatedPath));
    console.log('[Prisma] dbPath:', dbPath, 'exists:', fs.existsSync(dbPath));

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
