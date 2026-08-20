import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { BranchInventory } from '../../inventory/entities/branch-inventory.entity';
import { Order } from '../../orders/entities/order.entity';
import { StockTransfer } from '../../inventory/entities/stock-transfer.entity';

@Entity('branches')
export class Branch {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @BeforeInsert()
  generateUuidV7() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column()
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  @OneToMany(() => BranchInventory, (inventory) => inventory.branch)
  inventories: BranchInventory[];

  @OneToMany(() => Order, (order) => order.branch)
  orders: Order[];

  @OneToMany(() => StockTransfer, (transfer) => transfer.sourceBranch)
  sourceTransfers: StockTransfer[];

  @OneToMany(() => StockTransfer, (transfer) => transfer.targetBranch)
  targetTransfers: StockTransfer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
