import { Controller, Get, Param, Patch, Body, ParseIntPipe } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TableStatus } from '@prisma/client';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TableStatus,
  ) {
    return this.tablesService.updateStatus(id, status);
  }
}
