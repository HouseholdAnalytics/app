import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.reports)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column({ length: 50 })
  report_type: string;

  @Column('date')
  period_from: Date;

  @Column('date')
  period_to: Date;

  @Column('timestamp')
  created_at: Date;
}