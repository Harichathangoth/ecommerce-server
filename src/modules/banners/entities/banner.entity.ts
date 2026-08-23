import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

export enum BannerType {
  HERO_DARK = 'HERO_DARK',
  HERO_LIGHT = 'HERO_LIGHT',
  PROMO_CARD = 'PROMO_CARD',
}

@Entity('banners')
export class Banner {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @BeforeInsert()
  generateUuidV7() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: BannerType,
    default: BannerType.HERO_DARK,
  })
  type: BannerType;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  targetUrl: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
