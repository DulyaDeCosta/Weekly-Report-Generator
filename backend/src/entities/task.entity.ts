import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Report } from './report.entity';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Report, (report) => report.tasks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column({ type: 'varchar' })
  reportId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.NOT_STARTED,
  })
  status: TaskStatus;

  @Column({ type: 'int', default: 0 })
  plannedPercentage: number;

  @Column({ type: 'int', default: 0 })
  actualPercentage: number;

  @Column({ type: 'int', default: 0 })
  timePlannedHours: number;

  @Column({ type: 'int', default: 0 })
  timeSpentHours: number;

  @Column({ type: 'text', nullable: true })
  deliverable: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
