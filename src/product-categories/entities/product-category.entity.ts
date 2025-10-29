import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ unique: true })
  @IsNotEmpty()
  slug: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description: string;

  @Column({ nullable: true })
  @IsOptional()
  imageUrl: string;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToMany(() => Brand, (brand) => brand.categories)
  brands: Brand[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
