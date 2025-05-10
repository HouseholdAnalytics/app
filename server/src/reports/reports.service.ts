import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Transaction } from '../transactions/transaction.entity';
import { Between } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, createReportDto: CreateReportDto): Promise<Report> {
    const report = this.reportsRepository.create({
      ...createReportDto,
      user_id: userId,
      created_at: new Date(),
    });
    return this.reportsRepository.save(report);
  }

  async findAllByUser(userId: number): Promise<Report[]> {
    return this.reportsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return report;
  }

  async generateMonthlyReport(userId: number, fromDate: string, toDate: string) {
    const transactions = await this.transactionsRepository.find({
      where: {
        user_id: userId,
        date: Between(new Date(fromDate), new Date(toDate)),
      },
      relations: ['category'],
    });

    // Group by category and calculate totals
    const categoryTotals = {};
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      const { category, amount } = transaction;
      
      if (!categoryTotals[category.id]) {
        categoryTotals[category.id] = {
          name: category.name,
          type: category.type,
          total: 0,
        };
      }
      
      categoryTotals[category.id].total += Number(amount);
      
      if (category.type === 'income') {
        totalIncome += Number(amount);
      } else {
        totalExpense += Number(amount);
      }
    });

    return {
      period: { from: fromDate, to: toDate },
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      categories: Object.values(categoryTotals),
      transactions,
    };
  }
}