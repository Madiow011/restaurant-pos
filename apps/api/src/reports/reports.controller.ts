import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  daily(@Query('days') days?: string) { return this.reportsService.getDailySales(days ? parseInt(days) : 7); }

  @Get('monthly')
  monthly(@Query('months') months?: string) { return this.reportsService.getMonthlySales(months ? parseInt(months) : 6); }

  @Get('top-products')
  topProducts(@Query('limit') limit?: string) { return this.reportsService.getTopProducts(limit ? parseInt(limit) : 10); }

  @Get('summary/today')
  summaryToday() { return this.reportsService.getSummaryToday(); }

  @Get('summary/month')
  summaryMonth() { return this.reportsService.getSummaryMonth(); }

  @Get('categories')
  categories() { return this.reportsService.getCategoryStats(); }
}
