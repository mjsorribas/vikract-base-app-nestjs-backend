import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { TagTranslation } from './tag-translation.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsNotEmpty()
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TagTranslation, (translation) => translation.tag, {
    cascade: true,
  })
  translations: TagTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}