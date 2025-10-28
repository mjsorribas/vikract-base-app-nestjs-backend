import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { Language } from '../../languages/entities/language.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('article_translations')
export class ArticleTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  content: string;

  @Column()
  @IsNotEmpty()
  slug: string;

  @Column({ nullable: true })
  seoTitle: string;

  @Column({ type: 'text', nullable: true })
  seoDescription: string;

  @Column({ type: 'text', nullable: true })
  seoKeywords: string;

  @Column({ type: 'json', nullable: true })
  seoJsonLd: object;

  @ManyToOne(() => Article, (article) => article.translations, {
    onDelete: 'CASCADE',
  })
  article: Article;

  @ManyToOne(() => Language)
  language: Language;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}