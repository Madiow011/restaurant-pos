import { Controller, Get, Param, ParseIntPipe, Res, Header } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { Response } from 'express';

@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get(':orderId/data')
  getReceiptData(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.receiptService.getReceiptData(orderId);
  }

  @Get(':orderId/customer')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async customerReceipt(@Param('orderId', ParseIntPipe) orderId: number, @Res() res: Response) {
    res.send(await this.receiptService.generateCustomerReceiptHTML(orderId));
  }

  @Get(':orderId/kitchen')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async kitchenOrder(@Param('orderId', ParseIntPipe) orderId: number, @Res() res: Response) {
    res.send(await this.receiptService.generateKitchenOrderHTML(orderId));
  }

  @Get(':orderId/html')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async html(@Param('orderId', ParseIntPipe) orderId: number, @Res() res: Response) {
    res.send(await this.receiptService.generateCustomerReceiptHTML(orderId));
  }
}
