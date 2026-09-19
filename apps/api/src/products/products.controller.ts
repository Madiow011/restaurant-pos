import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.productsService.findAll(categoryId ? parseInt(categoryId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.productsService.findOne(id); }

  @Post()
  create(@Body() body: { name: string; price: number; categoryId: number; description?: string; sortOrder?: number }) {
    return this.productsService.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.productsService.remove(id); }

  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) { return this.productsService.hardDelete(id); }
}
