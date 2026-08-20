import { Entity, PrimaryColumn, Column, CreateDateColumn, BeforeInsert } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @BeforeInsert()
  generateUuidV7() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ nullable: true })
  userId: string;

  @Column()
  action: string; // e.g. "STOCK_TRANSFER_REQUESTED", "ORDER_STATUS_UPDATED", "PRICE_MODIFIED"

  @Column()
  entityName: string; // e.g. "BranchInventory", "Order", "ProductVariant"

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  timestamp: Date;
}
