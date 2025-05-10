import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    return this.categoriesRepository.findOne({ where: { id } });
  }

  async findByType(type: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { type: type as CategoryType },
    });
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.transactions && category.transactions.length > 0) {
      throw new BadRequestException('Cannot delete category that is in use by transactions');
    }

    await this.categoriesRepository.remove(category);
  }
}