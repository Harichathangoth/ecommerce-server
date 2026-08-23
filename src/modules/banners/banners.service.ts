import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner, BannerType } from './entities/banner.entity';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async findAll(): Promise<Banner[]> {
    try {
      return await this.bannerRepository.find({
        order: { displayOrder: 'ASC', createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch banners: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve banners list');
    }
  }

  async findActive(): Promise<Banner[]> {
    try {
      return await this.bannerRepository.find({
        where: { isActive: true },
        order: { displayOrder: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch active banners: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve active banners');
    }
  }

  async findOne(id: string): Promise<Banner> {
    try {
      const banner = await this.bannerRepository.findOne({ where: { id } });
      if (!banner) {
        throw new NotFoundException(`Banner with ID "${id}" not found`);
      }
      return banner;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to find banner with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch banner details');
    }
  }

  async create(dto: { title: string; type: BannerType; imageUrl: string; targetUrl?: string; displayOrder?: number }): Promise<Banner> {
    try {
      const banner = this.bannerRepository.create({
        ...dto,
        displayOrder: dto.displayOrder ?? 0,
      });
      return await this.bannerRepository.save(banner);
    } catch (error) {
      this.logger.error(`Failed to create banner: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create new banner record');
    }
  }

  async update(id: string, dto: Partial<Banner>): Promise<Banner> {
    try {
      const banner = await this.findOne(id);
      Object.assign(banner, dto);
      return await this.bannerRepository.save(banner);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to update banner with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update banner record');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const banner = await this.findOne(id);
      await this.bannerRepository.remove(banner);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to delete banner with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete banner record');
    }
  }
}
