import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        relations: ['customer', 'branch', 'items', 'items.variant', 'items.variant.product'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch orders: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve customer orders list');
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { orderNumber },
        relations: ['customer', 'branch', 'items', 'items.variant', 'items.variant.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with tracking number "${orderNumber}" not found`);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error tracking order "${orderNumber}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Database query failed while fetching order tracking details');
    }
  }

  async updateOrderStatus(id: string, status: any): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Order with ID "${id}" not found`);
      }
      order.status = status;
      return await this.orderRepository.save(order);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating order status for ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update order status');
    }
  }
}
