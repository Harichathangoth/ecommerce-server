import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  BeforeInsert,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Branch } from '../../branches/entities/branch.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('branch_inventories')
@Unique(['branchId', 'variantId'])
export class BranchInventory {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @BeforeInsert()
  generateUuidV7() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column()
  branchId: string;

  @ManyToOne(() => Branch, (branch) => branch.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column()
  variantId: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: 0 })
  reservedQuantity: number;

  @Column({ default: 5 })
  reorderLevel: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
