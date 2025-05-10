import { IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  comment: string;
}