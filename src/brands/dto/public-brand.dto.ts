import { Exclude } from 'class-transformer';
import { Brand } from '../entities/brand.entity';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';

export class PublicBrandDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  countryOfOrigin?: string;
  foundedYear?: number;
  categories: ProductCategory[];
  activeProductsCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Exclude internal fields from public view
  @Exclude()
  sortOrder: number;

  constructor(brand: Brand) {
    Object.assign(this, brand);
    this.activeProductsCount = brand.activeProductsCount;
  }
}
