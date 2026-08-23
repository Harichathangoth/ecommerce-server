import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find({
        order: { displayOrder: 'ASC', createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch categories: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve categories list');
    }
  }

  async findActive(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find({
        where: { isActive: true },
        order: { displayOrder: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch active categories: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve active categories');
    }
  }

  async findOne(id: string): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(`Category with ID "${id}" not found`);
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to find category with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch category details');
    }
  }

  async create(dto: { name: string; slug: string; description?: string; imageUrl?: string; displayOrder?: number }): Promise<Category> {
    try {
      const category = this.categoryRepository.create({
        ...dto,
        displayOrder: dto.displayOrder ?? 0,
      });
      return await this.categoryRepository.save(category);
    } catch (error) {
      this.logger.error(`Failed to create category: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create new category record');
    }
  }

  async update(id: string, dto: Partial<Category>): Promise<Category> {
    try {
      const category = await this.findOne(id);
      Object.assign(category, dto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to update category with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update category record');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const category = await this.findOne(id);
      await this.categoryRepository.remove(category);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to delete category with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete category record');
    }
  }
}
