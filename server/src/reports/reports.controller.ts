import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(req.user.userId, createReportDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.reportsService.findAllByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.reportsService.findOne(req.user.userId, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate/monthly')
  generateMonthlyReport(@Request() req, @Body() dateRange: { from: string; to: string }) {
    return this.reportsService.generateMonthlyReport(req.user.userId, dateRange.from, dateRange.to);
  }
}