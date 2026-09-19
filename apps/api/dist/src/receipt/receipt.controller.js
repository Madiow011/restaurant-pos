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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptController = void 0;
const common_1 = require("@nestjs/common");
const receipt_service_1 = require("./receipt.service");
let ReceiptController = class ReceiptController {
    constructor(receiptService) {
        this.receiptService = receiptService;
    }
    getReceiptData(orderId) {
        return this.receiptService.getReceiptData(orderId);
    }
    async customerReceipt(orderId, res) {
        res.send(await this.receiptService.generateCustomerReceiptHTML(orderId));
    }
    async kitchenOrder(orderId, res) {
        res.send(await this.receiptService.generateKitchenOrderHTML(orderId));
    }
    async html(orderId, res) {
        res.send(await this.receiptService.generateCustomerReceiptHTML(orderId));
    }
};
exports.ReceiptController = ReceiptController;
__decorate([
    (0, common_1.Get)(':orderId/data'),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceiptController.prototype, "getReceiptData", null);
__decorate([
    (0, common_1.Get)(':orderId/customer'),
    (0, common_1.Header)('Content-Type', 'text/html; charset=utf-8'),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReceiptController.prototype, "customerReceipt", null);
__decorate([
    (0, common_1.Get)(':orderId/kitchen'),
    (0, common_1.Header)('Content-Type', 'text/html; charset=utf-8'),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReceiptController.prototype, "kitchenOrder", null);
__decorate([
    (0, common_1.Get)(':orderId/html'),
    (0, common_1.Header)('Content-Type', 'text/html; charset=utf-8'),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReceiptController.prototype, "html", null);
exports.ReceiptController = ReceiptController = __decorate([
    (0, common_1.Controller)('receipt'),
    __metadata("design:paramtypes", [receipt_service_1.ReceiptService])
], ReceiptController);
//# sourceMappingURL=receipt.controller.js.map