import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { ArticleTranslation } from './article-translation.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsNotEmpty()
  slug: string;

  @Column({
    type: 'varchar',
    default: 'draft',
  })
  status: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  scheduledAt: Date;

  @ManyToOne(() => Blog, (blog) => blog.articles)
  blog: Blog;

  @ManyToOne(() => User)
  author: User;

  @ManyToOne(() => User, { nullable: true })
  editor: User;

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'article_categories',
    joinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'categoryId',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'article_tags',
    joinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @OneToMany(() => ArticleTranslation, (translation) => translation.article, {
    cascade: true,
  })
  translations: ArticleTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}