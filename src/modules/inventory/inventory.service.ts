import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchInventory } from './entities/branch-inventory.entity';
import { StockTransfer } from './entities/stock-transfer.entity';
import { TransferStatus } from '../../common/enums/transfer-status.enum';

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

  async createTransfer(dto: {
    sourceBranchId: string;
    targetBranchId: string;
    variantId: string;
    quantity: number;
    notes?: string;
  }): Promise<StockTransfer> {
    try {
      const transfer = this.transferRepository.create({
        ...dto,
        status: TransferStatus.REQUESTED,
      });
      return await this.transferRepository.save(transfer);
    } catch (error) {
      this.logger.error(`Failed to initiate stock transfer: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to initiate stock transfer');
    }
  }

  async updateTransferStatus(id: string, status: TransferStatus): Promise<StockTransfer> {
    try {
      const transfer = await this.transferRepository.findOne({ where: { id } });
      if (!transfer) {
        throw new NotFoundException(`Stock transfer record with ID "${id}" not found`);
      }
      transfer.status = status;
      return await this.transferRepository.save(transfer);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to update transfer status for ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update transfer status');
    }
  }
}
