import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Carousel } from './carousel.entity';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUrl,
  IsBoolean,
} from 'class-validator';

@Entity('carousel_slides')
export class CarouselSlide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  imageUrl: string;

  @Column({ nullable: true })
  @IsOptional()
  title: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  linkUrl: string;

  @Column({ default: '_self' })
  linkTarget: string; // '_self', '_blank', '_parent', '_top'

  @Column()
  @IsNumber()
  order: number;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ nullable: true })
  @IsOptional()
  altText: string;

  @ManyToOne(() => Carousel, (carousel) => carousel.slides, {
    onDelete: 'CASCADE',
  })
  carousel: Carousel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
