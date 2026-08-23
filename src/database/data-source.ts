import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/roles/entities/role.entity';
import { Permission } from '../modules/roles/entities/permission.entity';
import { Branch } from '../modules/branches/entities/branch.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductVariant } from '../modules/products/entities/product-variant.entity';
import { ProductSpecification } from '../modules/products/entities/product-specification.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Banner } from '../modules/banners/entities/banner.entity';
import { BranchInventory } from '../modules/inventory/entities/branch-inventory.entity';
import { StockTransfer } from '../modules/inventory/entities/stock-transfer.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecommerce_db',
  entities: [
    User,
    Role,
    Permission,
    Branch,
    Product,
    ProductVariant,
    ProductSpecification,
    Category,
    Banner,
    BranchInventory,
    StockTransfer,
    Order,
    OrderItem,
    AuditLog,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
