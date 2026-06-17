import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, CheckoutOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/items')
  addItems(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateOrderDto) {
    return this.ordersService.addItems(id, dto);
  }

  @Patch(':id/checkout')
  checkout(@Param('id', ParseIntPipe) id: number, @Body() dto: CheckoutOrderDto) {
    return this.ordersService.checkout(id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancel(id);
  }
}
