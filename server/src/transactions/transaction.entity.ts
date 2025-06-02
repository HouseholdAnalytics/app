import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Category, category => category.transactions)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  category_id: number;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column('date')
  date: Date;

  @Column('text', { nullable: true })
  comment: string;
}