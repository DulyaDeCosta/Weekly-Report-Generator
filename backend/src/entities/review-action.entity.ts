import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Report } from './report.entity';
import { User } from './user.entity';

export enum ReviewActionType {
  APPROVED = 'APPROVED',
  REQUESTED_CHANGES = 'REQUESTED_CHANGES',
}

@Entity('review_actions')
export class ReviewAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Report, (report) => report.reviewActions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column({ type: 'varchar' })
  reportId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'varchar' })
  reviewerId: string;

  @Column({
    type: 'enum',
    enum: ReviewActionType,
  })
  actionType: ReviewActionType;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
