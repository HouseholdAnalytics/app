import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      user_id: userId
    });
    return this.categoriesRepository.save(category);
  }

  async findAll(userId: number): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { user_id: userId }
    });
  }

  async findOne(id: number, userId: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, user_id: userId }
    });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    return category;
  }

  async findByType(type: string, userId: number): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: {
        type: type as CategoryType,
        user_id: userId
      }
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, userId: number): Promise<Category> {
    const category = await this.findOne(id, userId);
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    Object.assign(category, updateCategoryDto);
    
    return this.categoriesRepository.save(category);
  }

  async remove(id: number, userId: number): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id, user_id: userId },
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