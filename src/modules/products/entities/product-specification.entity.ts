import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Product } from './product.entity';

@Entity('product_specifications')
export class ProductSpecification {
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

  @ManyToOne(() => Product, (product) => product.specifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  key: string;

  @Column()
  value: string;
}
