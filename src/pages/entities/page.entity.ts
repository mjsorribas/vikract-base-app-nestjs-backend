import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Carousel } from '../../carousels/entities/carousel.entity';

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
}

@Entity('pages')
@Index(['slug'], { unique: true })
@Index(['status'])
@Index(['showInHomeMenu'])
@Index(['showInFooterMenu'])
@Index(['parentId'])
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  subtitle: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PageStatus.DRAFT,
  })
  status: PageStatus;

  // SEO Fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  seoTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seoDescription: string;

  @Column({ type: 'text', nullable: true })
  seoKeywords: string;

  @Column({ type: 'text', nullable: true })
  seoJsonLd: string;

  // Menu Options
  @Column({ type: 'boolean', default: false })
  showInHomeMenu: boolean;

  @Column({ type: 'boolean', default: false })
  showInFooterMenu: boolean;

  @Column({ type: 'integer', default: 0 })
  menuOrder: number;

  // Media
  @Column({ type: 'varchar', length: 500, nullable: true })
  mainImage: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mainVideo: string;

  // Publishing Options
  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  scheduledAt: Date;

  // Hierarchical Structure
  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => Page, (page) => page.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Page;

  @OneToMany(() => Page, (page) => page.parent)
  children: Page[];

  // Author
  @Column({ type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'authorId' })
  author: User;

  // Carousels
  @OneToMany(() => Carousel, (carousel) => carousel.page, {
    cascade: true,
  })
  carousels: Carousel[];

  // Metadata
  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get isPublished(): boolean {
    return this.status === PageStatus.PUBLISHED && this.isActive;
  }

  get isScheduled(): boolean {
    return (
      this.status === PageStatus.SCHEDULED &&
      this.scheduledAt &&
      this.scheduledAt > new Date()
    );
  }

  get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  get breadcrumb(): string[] {
    const breadcrumb: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let currentPage: Page = this;
    
    while (currentPage) {
      breadcrumb.unshift(currentPage.title);
      currentPage = currentPage.parent;
    }
    
    return breadcrumb;
  }
}
