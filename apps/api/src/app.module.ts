import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { TablesController } from './tables/tables.controller';
import { TablesService } from './tables/tables.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { PaymentModule } from './payment/payment.module';
import { ReceiptModule } from './receipt/receipt.module';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';
import { ExportModule } from './export/export.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [PrismaModule, PaymentModule, ReceiptModule, ReportsModule, AuthModule, ExportModule, FinanceModule],
  controllers: [CategoriesController, ProductsController, TablesController, OrdersController],
  providers: [CategoriesService, ProductsService, TablesService, OrdersService],
})
export class AppModule {}
