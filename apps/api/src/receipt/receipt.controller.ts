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

  @Get(':orderId/html')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getReceiptHTML(@Param('orderId', ParseIntPipe) orderId: number, @Res() res: Response) {
    const html = await this.receiptService.generateReceiptHTML(orderId);
    res.send(html);
  }
}
