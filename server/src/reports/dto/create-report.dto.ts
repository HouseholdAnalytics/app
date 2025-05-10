import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  report_type: string;

  @IsNotEmpty()
  @IsDateString()
  period_from: string;

  @IsNotEmpty()
  @IsDateString()
  period_to: string;
}