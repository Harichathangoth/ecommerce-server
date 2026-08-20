import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

@ApiTags('Orders & Fulfillment')
@Controller('orders')
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
}
