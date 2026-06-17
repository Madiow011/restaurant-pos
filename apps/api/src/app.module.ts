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

@Module({
  imports: [PrismaModule],
  controllers: [
    CategoriesController,
    ProductsController,
    TablesController,
    OrdersController,
  ],
  providers: [
    CategoriesService,
    ProductsService,
    TablesService,
    OrdersService,
  ],
})
export class AppModule {}
