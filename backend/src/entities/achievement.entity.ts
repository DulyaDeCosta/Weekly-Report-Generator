import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Report } from './report.entity';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Report, (report) => report.achievements, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column({ type: 'varchar' })
  reportId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false })
  isKey: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
