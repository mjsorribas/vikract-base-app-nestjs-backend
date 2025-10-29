import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';
import { ProductMedia } from './product-media.entity';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDecimal,
  Min,
} from 'class-validator';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ unique: true })
  @IsNotEmpty()
  productCode: string;

  @Column({ unique: true })
  @IsNotEmpty()
  slug: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  longDescription: string;

  @Column()
  @IsNotEmpty()
  shortDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsDecimal()
  @Min(0)
  salePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsDecimal()
  @Min(0)
  offerPrice: number;

  @Column({ default: false })
  @IsBoolean()
  isOfferActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsDecimal()
  @Min(0)
  purchasePrice: number;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  availableStock: number;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  stockLimit: number;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  @IsOptional()
  @IsDecimal()
  @Min(0)
  weight: number;

  @Column({ nullable: true })
  @IsOptional()
  size: string;

  @Column({ default: true })
  @IsBoolean()
  hasShipping: boolean;

  @Column({ default: true })
  @IsBoolean()
  hasPickup: boolean;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ nullable: true })
  @IsOptional()
  mainImageUrl: string;

  @Column({ nullable: true })
  @IsOptional()
  mainVideoUrl: string;

  @Column({ nullable: true })
  @IsOptional()
  thumbnailSmall: string;

  @Column({ nullable: true })
  @IsOptional()
  thumbnailMedium: string;

  @Column({ nullable: true })
  @IsOptional()
  thumbnailLarge: string;

  @ManyToOne(() => ProductCategory, (category) => category.products)
  category: ProductCategory;

  @OneToMany(() => ProductMedia, (media) => media.product, {
    cascade: true,
  })
  media: ProductMedia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Computed properties
  get isInStock(): boolean {
    return this.availableStock > this.stockLimit;
  }

  get currentPrice(): number {
    return this.isOfferActive && this.offerPrice
      ? this.offerPrice
      : this.salePrice;
  }

  get isOnSale(): boolean {
    return (
      this.isOfferActive &&
      this.offerPrice !== null &&
      this.offerPrice < this.salePrice
    );
  }
}
