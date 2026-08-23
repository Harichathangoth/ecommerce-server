import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SystemPermission } from '../../common/enums/permissions.enum';

@ApiTags('Categories')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List active store categories (Public)' })
  async getActiveCategories(): Promise<Category[]> {
    return await this.categoriesService.findActive();
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.CATEGORIES_MANAGE)
  @ApiOperation({ summary: 'List all categories for admin management' })
  async getAllCategories(): Promise<Category[]> {
    return await this.categoriesService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.CATEGORIES_MANAGE)
  @ApiOperation({ summary: 'Create new store category' })
  async createCategory(
    @Body() dto: { name: string; slug: string; description?: string; imageUrl?: string; displayOrder?: number },
  ): Promise<Category> {
    return await this.categoriesService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.CATEGORIES_MANAGE)
  @ApiOperation({ summary: 'Update store category' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: Partial<Category>,
  ): Promise<Category> {
    return await this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.CATEGORIES_MANAGE)
  @ApiOperation({ summary: 'Delete store category' })
  async deleteCategory(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoriesService.delete(id);
    return { message: 'Category deleted successfully' };
  }
}
