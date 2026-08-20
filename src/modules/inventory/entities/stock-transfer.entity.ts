import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Branch } from '../../branches/entities/branch.entity';
import { TransferStatus } from '../../../common/enums/transfer-status.enum';

@Entity('stock_transfers')
export class StockTransfer {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @BeforeInsert()
  generateUuidV7() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ unique: true })
  transferNumber: string;

  @Column()
  sourceBranchId: string;

  @ManyToOne(() => Branch, (branch) => branch.sourceTransfers)
  @JoinColumn({ name: 'sourceBranchId' })
  sourceBranch: Branch;

  @Column()
  targetBranchId: string;

  @ManyToOne(() => Branch, (branch) => branch.targetTransfers)
  @JoinColumn({ name: 'targetBranchId' })
  targetBranch: Branch;

  @Column()
  variantId: string;

  @Column()
  quantity: number;

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.REQUESTED })
  status: TransferStatus;

  @Column()
  requestedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
