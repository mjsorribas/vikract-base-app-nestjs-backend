import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { User } from '../../users/entities/user.entity';
import { FileType, FileFormat } from '../interfaces/storage.interface';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  path: string;

  @Column()
  url: string;

  @Column('int')
  size: number;

  @Column()
  mimeType: string;

  @Column({
    type: 'enum',
    enum: FileType,
  })
  type: FileType;

  @Column({
    type: 'enum',
    enum: FileFormat,
  })
  format: FileFormat;

  @Column({ nullable: true })
  blogId?: string;

  @Column({ nullable: true })
  uploadedById?: string;

  @Column('json', { nullable: true })
  processedVersions?: any[];

  @Column('json', { nullable: true })
  metadata?: any;

  @Column({ nullable: true })
  folder?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => Blog, { nullable: true })
  @JoinColumn({ name: 'blogId' })
  blog?: Blog;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy?: User;
}