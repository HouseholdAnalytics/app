import { IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { CategoryType } from "../category.entity";

export class UpdateCategoryDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
