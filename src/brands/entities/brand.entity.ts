import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';
import { IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';

@Entity('brands')
export class Brand {
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
  @IsUrl()
  logoUrl: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  websiteUrl: string;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  @IsOptional()
  countryOfOrigin: string;

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  foundedYear: number;

  // Una marca puede tener muchos productos
  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];

  // Una marca puede estar asociada a muchas categorías
  // Una categoría puede tener muchas marcas
  @ManyToMany(() => ProductCategory, (category) => category.brands)
  @JoinTable({
    name: 'brand_categories',
    joinColumn: {
      name: 'brand_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: ProductCategory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Computed property
  get activeProductsCount(): number {
    return this.products?.filter((product) => product.isActive).length || 0;
  }
}