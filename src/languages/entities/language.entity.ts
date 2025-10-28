import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 5 })
  @IsNotEmpty()
  code: string; // e.g., 'en', 'es', 'fr'

  @Column()
  @IsNotEmpty()
  name: string; // e.g., 'English', 'Spanish', 'French'

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}