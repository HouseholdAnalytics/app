import { IsNotEmpty, IsEnum } from 'class-validator';
import { CategoryType } from '../category.entity';

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;
}