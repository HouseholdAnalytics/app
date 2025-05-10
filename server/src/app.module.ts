import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1',
      database: 'test123',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Only for development
    }),
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    ReportsModule,
    AuthModule,
  ],
})
export class AppModule {}