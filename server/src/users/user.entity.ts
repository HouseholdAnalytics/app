import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { Report } from '../reports/report.entity';
import { Category } from '../categories/category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Report, report => report.user)
  reports: Report[];

  @OneToMany(() => Category, category => category.user)
  categories: Category[];
}