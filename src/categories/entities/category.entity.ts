import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { CategoryTranslation } from './category-translation.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsNotEmpty()
  slug: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => CategoryTranslation, (translation) => translation.category, {
    cascade: true,
  })
  translations: CategoryTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}