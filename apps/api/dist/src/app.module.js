"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const categories_controller_1 = require("./categories/categories.controller");
const categories_service_1 = require("./categories/categories.service");
const products_controller_1 = require("./products/products.controller");
const products_service_1 = require("./products/products.service");
const tables_controller_1 = require("./tables/tables.controller");
const tables_service_1 = require("./tables/tables.service");
const orders_controller_1 = require("./orders/orders.controller");
const orders_service_1 = require("./orders/orders.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            categories_controller_1.CategoriesController,
            products_controller_1.ProductsController,
            tables_controller_1.TablesController,
            orders_controller_1.OrdersController,
        ],
        providers: [
            categories_service_1.CategoriesService,
            products_service_1.ProductsService,
            tables_service_1.TablesService,
            orders_service_1.OrdersService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map