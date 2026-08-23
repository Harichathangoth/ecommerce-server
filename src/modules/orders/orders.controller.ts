import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SystemPermission } from '../../common/enums/permissions.enum';

@ApiTags('Orders & Fulfillment')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all customer orders for fulfillment & dispatch' })
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'Track customer order status by Order Tracking Number' })
  async trackOrder(@Param('orderNumber') orderNumber: string): Promise<Order> {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(SystemPermission.ORDERS_DISPATCH)
  @ApiOperation({ summary: 'Update customer order fulfillment dispatch status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: string },
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, dto.status);
  }
}
