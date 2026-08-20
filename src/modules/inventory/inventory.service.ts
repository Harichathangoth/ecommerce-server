import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchInventory } from './entities/branch-inventory.entity';
import { StockTransfer } from './entities/stock-transfer.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(BranchInventory)
    private readonly inventoryRepository: Repository<BranchInventory>,
    @InjectRepository(StockTransfer)
    private readonly transferRepository: Repository<StockTransfer>,
  ) {}

  async findByBranch(branchId: string): Promise<BranchInventory[]> {
    try {
      return await this.inventoryRepository.find({
        where: { branchId },
        relations: ['variant', 'variant.product'],
      });
    } catch (error) {
      this.logger.error(`Failed to fetch inventory for branch "${branchId}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve branch inventory matrix');
    }
  }

  async findAllTransfers(): Promise<StockTransfer[]> {
    try {
      return await this.transferRepository.find({
        relations: ['sourceBranch', 'targetBranch'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch stock transfers: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve inter-branch stock transfers');
    }
  }
}
