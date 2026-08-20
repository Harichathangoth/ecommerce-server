import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { PaginationMeta } from '../../common/interfaces/pagination-meta.interface';
import { QueryFilterDto, SortOrder } from './dto/query-filter.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    category?: string,
  ): Promise<{ items: Product[]; meta: PaginationMeta }> {
    try {
      const skip = (page - 1) * limit;
      const query = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.variants', 'variants')
        .leftJoinAndSelect('product.specifications', 'specifications')
        .skip(skip)
        .take(limit);

      if (category) {
        query.where('LOWER(product.category) = LOWER(:category)', { category });
      }

      const [items, total] = await query.getManyAndCount();
      const totalPage = Math.ceil(total / limit) || 1;

      const meta: PaginationMeta = {
        page,
        limit,
        total,
        totalPage,
        hasNextPage: page < totalPage,
        hasPreviousPage: page > 1,
      };

      return { items, meta };
    } catch (error) {
      this.logger.error(`Failed to fetch products catalog: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve products catalog');
    }
  }

  async queryProducts(
    filterDto: QueryFilterDto,
  ): Promise<{ items: Product[]; meta: PaginationMeta }> {
    try {
      const page = filterDto.page || 1;
      const limit = filterDto.limit || 20;
      const skip = (page - 1) * limit;

      const query = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.variants', 'variants')
        .leftJoinAndSelect('product.specifications', 'specifications')
        .skip(skip)
        .take(limit);

      if (filterDto.search) {
        query.andWhere(
          '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
          { search: `%${filterDto.search}%` },
        );
      }

      if (filterDto.category) {
        query.andWhere('LOWER(product.category) = LOWER(:category)', {
          category: filterDto.category,
        });
      }

      if (filterDto.minPrice !== undefined) {
        query.andWhere('product.basePrice >= :minPrice', {
          minPrice: filterDto.minPrice,
        });
      }

      if (filterDto.maxPrice !== undefined) {
        query.andWhere('product.basePrice <= :maxPrice', {
          maxPrice: filterDto.maxPrice,
        });
      }

      if (filterDto.inStock !== undefined) {
        query.andWhere('product.isActive = :inStock', {
          inStock: filterDto.inStock,
        });
      }

      const sortColumn = filterDto.sortBy ? `product.${filterDto.sortBy}` : 'product.createdAt';
      const sortDirection = filterDto.sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';
      query.orderBy(sortColumn, sortDirection);

      const [items, total] = await query.getManyAndCount();
      const totalPage = Math.ceil(total / limit) || 1;

      const meta: PaginationMeta = {
        page,
        limit,
        total,
        totalPage,
        hasNextPage: page < totalPage,
        hasPreviousPage: page > 1,
      };

      return { items, meta };
    } catch (error) {
      this.logger.error(`Failed executing product query search: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to execute product search query');
    }
  }

  async findBySlug(slug: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { slug },
        relations: ['variants', 'specifications'],
      });

      if (!product) {
        throw new NotFoundException(`Product with slug "${slug}" not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding product by slug "${slug}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('An unexpected database error occurred while fetching product');
    }
  }
}
