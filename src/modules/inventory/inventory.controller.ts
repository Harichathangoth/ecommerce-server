import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { BranchInventory } from './entities/branch-inventory.entity';
import { StockTransfer } from './entities/stock-transfer.entity';

@ApiTags('Inventory & Transfers')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'Get stock inventory levels for a specific branch' })
  async findByBranch(@Param('branchId') branchId: string): Promise<BranchInventory[]> {
    return this.inventoryService.findByBranch(branchId);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get all inter-branch stock transfer records' })
  async findAllTransfers(): Promise<StockTransfer[]> {
    return this.inventoryService.findAllTransfers();
  }
}
