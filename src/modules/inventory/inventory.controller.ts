import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { BranchInventory } from './entities/branch-inventory.entity';
import { StockTransfer } from './entities/stock-transfer.entity';
import { TransferStatus } from '../../common/enums/transfer-status.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SystemPermission } from '../../common/enums/permissions.enum';

@ApiTags('Inventory & Transfers')
@Controller({ path: 'inventory', version: '1' })
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

  @Post('transfers')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.TRANSFERS_INITIATE)
  @ApiOperation({ summary: 'Initiate new inter-branch stock transfer request' })
  async createTransfer(
    @Body() dto: { sourceBranchId: string; targetBranchId: string; variantId: string; quantity: number; notes?: string },
  ): Promise<StockTransfer> {
    return this.inventoryService.createTransfer(dto);
  }

  @Patch('transfers/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.TRANSFERS_APPROVE)
  @ApiOperation({ summary: 'Update inter-branch stock transfer status' })
  async updateTransferStatus(
    @Param('id') id: string,
    @Body() dto: { status: TransferStatus },
  ): Promise<StockTransfer> {
    return this.inventoryService.updateTransferStatus(id, dto.status);
  }
}
