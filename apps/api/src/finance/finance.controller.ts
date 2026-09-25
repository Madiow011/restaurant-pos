import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('expenses')
  getExpenses(@Query('month') month?: string) { return this.financeService.findExpenses(month); }

  @Post('expenses')
  createExpense(@Body() body: any) { return this.financeService.createExpense(body); }

  @Patch('expenses/:id')
  updateExpense(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.financeService.updateExpense(id, body);
  }

  @Delete('expenses/:id')
  deleteExpense(@Param('id', ParseIntPipe) id: number) { return this.financeService.deleteExpense(id); }

  @Get('pl/:month')
  getProfitLoss(@Param('month') month: string) { return this.financeService.getProfitLoss(month); }

  @Get('yearly/:year')
  getYearlySummary(@Param('year') year: string) { return this.financeService.getYearlySummary(parseInt(year)); }
}
