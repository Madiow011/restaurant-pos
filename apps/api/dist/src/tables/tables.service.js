"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TablesService = class TablesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.table.findMany({
            orderBy: { number: 'asc' },
            include: {
                orders: {
                    where: { status: { in: ['OPEN', 'CONFIRMED', 'READY'] } },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
    }
    findOne(id) {
        return this.prisma.table.findUnique({
            where: { id },
            include: {
                orders: {
                    where: { status: { in: ['OPEN', 'CONFIRMED', 'READY'] } },
                    include: { orderItems: { include: { product: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
    }
    updateStatus(id, status) {
        return this.prisma.table.update({
            where: { id },
            data: { status },
        });
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map