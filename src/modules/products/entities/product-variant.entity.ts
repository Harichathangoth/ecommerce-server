import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Product } from './product.entity';
import { BranchInventory } from '../../inventory/entities/branch-inventory.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @BeforeInsert()
  generateUuidV7() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costPrice: number;

  @Column({ type: 'json' })
  attributes: Record<string, any>;

  @Column('text', { array: true })
  images: string[];

  @OneToMany(() => BranchInventory, (inventory) => inventory.variant)
  inventories: BranchInventory[];

  @OneToMany(() => OrderItem, (item) => item.variant)
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
