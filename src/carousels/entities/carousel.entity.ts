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
import { Article } from '../../articles/entities/article.entity';
import { Page } from '../../pages/entities/page.entity';
import { CarouselSlide } from './carousel-slide.entity';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

@Entity('carousels')
export class Carousel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description: string;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ default: 0 })
  autoplayDelay: number; // en milisegundos, 0 = sin autoplay

  @Column({ default: true })
  @IsBoolean()
  showIndicators: boolean;

  @Column({ default: true })
  @IsBoolean()
  showNavigation: boolean;

  @ManyToOne(() => Article, { nullable: true, onDelete: 'SET NULL' })
  article: Article;

  @ManyToOne(() => Page, { nullable: true, onDelete: 'SET NULL' })
  page?: Page;

  @OneToMany(() => CarouselSlide, (slide) => slide.carousel, {
    cascade: true,
    eager: true,
  })
  slides: CarouselSlide[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
