import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Report } from '../entities/report.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Project])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
