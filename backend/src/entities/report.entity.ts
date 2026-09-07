import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { Blocker } from './blocker.entity';
import { Achievement } from './achievement.entity';
import { ReviewAction } from './review-action.entity';

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  NEEDS_CORRECTION = 'NEEDS_CORRECTION',
  APPROVED = 'APPROVED',
}

@Entity('reports')
@Unique('UQ_report_author_week', ['author', 'weekStartDate'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'varchar' })
  authorId: string;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar' })
  projectId: string;

  @Column({ type: 'date' })
  weekStartDate: Date;

  @Column({ type: 'date' })
  weekEndDate: Date;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
  })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  tasksPlannedNextWeek: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'int', default: 0 })
  hoursDevelopment: number;

  @Column({ type: 'int', default: 0 })
  hoursTesting: number;

  @Column({ type: 'int', default: 0 })
  hoursMeetings: number;

  @Column({ type: 'int', default: 0 })
  hoursDocumentation: number;

  @Column({ type: 'text', nullable: true })
  latestReviewComment: string | null;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @OneToMany(() => Task, (task) => task.report, {
    cascade: true,
    eager: false,
  })
  tasks: Task[];

  @OneToMany(() => Blocker, (blocker) => blocker.report, {
    cascade: true,
    eager: false,
  })
  blockers: Blocker[];

  @OneToMany(() => Achievement, (achievement) => achievement.report, {
    cascade: true,
    eager: false,
  })
  achievements: Achievement[];

  @OneToMany(() => ReviewAction, (action) => action.report, {
    cascade: false,
    eager: false,
  })
  reviewActions: ReviewAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
