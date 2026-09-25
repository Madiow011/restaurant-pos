import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { ExportService } from './export.service';
import { Response } from 'express';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('csv')
  async exportCSV(
    @Query('start') start: string,
    @Query('end') end: string,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.getOrdersCSV(start, end);
    const filename = `orders_${start || 'all'}_${end || 'all'}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('report')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async exportReport(
    @Query('start') start: string,
    @Query('end') end: string,
    @Res() res: Response,
  ) {
    res.send(await this.exportService.getSummaryHTML(start, end));
  }
}
