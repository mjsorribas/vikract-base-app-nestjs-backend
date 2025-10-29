import { PickType } from '@nestjs/mapped-types';
import { Product } from '../entities/product.entity';

export class PublicProductDto extends PickType(Product, [
  'id',
  'name',
  'productCode',
  'slug',
  'longDescription',
  'shortDescription',
  'salePrice',
  'offerPrice',
  'isOfferActive',
  'availableStock',
  'weight',
  'size',
  'hasShipping',
  'hasPickup',
  'isActive',
  'mainImageUrl',
  'mainVideoUrl',
  'thumbnailSmall',
  'thumbnailMedium',
  'thumbnailLarge',
  'category',
  'media',
  'createdAt',
  'updatedAt',
] as const) {
  // Computed properties from entity
  isInStock: boolean;
  currentPrice: number;
  isOnSale: boolean;
}
