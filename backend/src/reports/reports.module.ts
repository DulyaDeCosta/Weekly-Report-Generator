import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from '../entities/report.entity';
import { Task } from '../entities/task.entity';
import { Blocker } from '../entities/blocker.entity';
import { Achievement } from '../entities/achievement.entity';
import { ReviewAction } from '../entities/review-action.entity';
import { Project } from '../entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      Task,
      Blocker,
      Achievement,
      ReviewAction,
      Project,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
