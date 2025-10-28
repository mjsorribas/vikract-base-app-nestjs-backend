import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Language } from '../../languages/entities/language.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('tag_translations')
export class TagTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  @IsNotEmpty()
  slug: string;

  @ManyToOne(() => Tag, (tag) => tag.translations, {
    onDelete: 'CASCADE',
  })
  tag: Tag;

  @ManyToOne(() => Language)
  language: Language;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}