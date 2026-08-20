import { Controller, Get, Post, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { PaginationMeta } from '../../common/interfaces/pagination-meta.interface';
import { QueryFilterDto } from './dto/query-filter.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get product catalog with optional category & pagination' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<{ items: Product[]; meta: PaginationMeta }> {
    return this.productsService.findAll(+page, +limit, category);
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search product catalog using HTTP QUERY / POST method' })
  async queryProducts(
    @Body() filterDto: QueryFilterDto,
  ): Promise<{ items: Product[]; meta: PaginationMeta }> {
    return this.productsService.queryProducts(filterDto);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product details by slug with variants & specs' })
  async findOne(@Param('slug') slug: string): Promise<Product> {
    return this.productsService.findBySlug(slug);
  }
}
