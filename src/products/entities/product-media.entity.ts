import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('product_media')
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  @IsIn(Object.values(MediaType))
  type: MediaType;

  @Column()
  @IsNotEmpty()
  url: string;

  @Column({ nullable: true })
  @IsOptional()
  thumbnailSmall: string;

  @Column({ nullable: true })
  @IsOptional()
  thumbnailMedium: string;

  @Column({ nullable: true })
  @IsOptional()
  thumbnailLarge: string;

  @Column({ nullable: true })
  @IsOptional()
  altText: string;

  @Column({ default: 0 })
  @IsNumber()
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Product, (product) => product.media, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
