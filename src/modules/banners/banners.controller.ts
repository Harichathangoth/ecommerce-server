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
import { BannersService } from './banners.service';
import { Banner, BannerType } from './entities/banner.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SystemPermission } from '../../common/enums/permissions.enum';

@ApiTags('Banners & Promotions')
@Controller({ path: 'banners', version: '1' })
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'List active storefront banners (Public)' })
  async getActiveBanners(): Promise<Banner[]> {
    return await this.bannersService.findActive();
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.BANNERS_MANAGE)
  @ApiOperation({ summary: 'List all banners for admin management' })
  async getAllBanners(): Promise<Banner[]> {
    return await this.bannersService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.BANNERS_MANAGE)
  @ApiOperation({ summary: 'Create new banner' })
  async createBanner(
    @Body() dto: { title: string; type: BannerType; imageUrl: string; targetUrl?: string; displayOrder?: number },
  ): Promise<Banner> {
    return await this.bannersService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.BANNERS_MANAGE)
  @ApiOperation({ summary: 'Update banner details or active status' })
  async updateBanner(
    @Param('id') id: string,
    @Body() dto: Partial<Banner>,
  ): Promise<Banner> {
    return await this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.BANNERS_MANAGE)
  @ApiOperation({ summary: 'Delete banner' })
  async deleteBanner(@Param('id') id: string): Promise<{ message: string }> {
    await this.bannersService.delete(id);
    return { message: 'Banner deleted successfully' };
  }
}
