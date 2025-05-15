import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { User } from '../users/user.entity';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type: CategoryType;

  @ManyToOne(() => User, user => user.categories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];
}