import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Branch } from '../modules/branches/entities/branch.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductVariant } from '../modules/products/entities/product-variant.entity';
import { ProductSpecification } from '../modules/products/entities/product-specification.entity';
import { BranchInventory } from '../modules/inventory/entities/branch-inventory.entity';
import { StockTransfer } from '../modules/inventory/entities/stock-transfer.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          User,
          Branch,
          Product,
          ProductVariant,
          ProductSpecification,
          BranchInventory,
          StockTransfer,
          Order,
          OrderItem,
          AuditLog,
        ],
        synchronize: true, // Set to false in production with migrations
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
