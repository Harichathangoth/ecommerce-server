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
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { OrderItem } from './order-item.entity';
import { FulfillmentType } from '../../../common/enums/fulfillment-type.enum';
import { OrderStatus } from '../../../common/enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @BeforeInsert()
  generateUuidV7() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ unique: true })
  orderNumber: string;

  @Column()
  customerId: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, (branch) => branch.orders, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ type: 'enum', enum: FulfillmentType, default: FulfillmentType.HOME_DELIVERY })
  fulfillmentType: FulfillmentType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'json', nullable: true })
  shippingAddress: Record<string, any>;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
