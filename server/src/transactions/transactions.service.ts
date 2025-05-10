import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      user_id: userId,
    });
    return this.transactionsRepository.save(transaction);
  }

  async findAllByUser(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { user_id: userId },
      relations: ['category'],
      order: { date: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return transaction;
  }

  async remove(userId: number, id: number): Promise<void> {
    const transaction = await this.findOne(userId, id);
    await this.transactionsRepository.remove(transaction);
  }
}