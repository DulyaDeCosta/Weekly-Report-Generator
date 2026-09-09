import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Report, ReportStatus } from '../entities/report.entity';
import { Task } from '../entities/task.entity';
import { Blocker } from '../entities/blocker.entity';
import { Achievement } from '../entities/achievement.entity';
import {
  ReviewAction,
  ReviewActionType,
} from '../entities/review-action.entity';
import { Project } from '../entities/project.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';
import { ListReportsDto } from './dto/list-reports.dto';
import {
  getMondayOfCurrentWeek,
  getSundayOfCurrentWeek,
  formatDateOnly,
} from './utils/week.util';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Blocker)
    private readonly blockerRepository: Repository<Blocker>,
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
    @InjectRepository(ReviewAction)
    private readonly reviewActionRepository: Repository<ReviewAction>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  // async createDraft(user: User, dto: CreateReportDto): Promise<Report> {
  //   const project = await this.projectRepository.findOne({
  //     where: { id: dto.projectId, isActive: true },
  //   });
  //   if (!project) {
  //     throw new NotFoundException('Project not found or inactive');
  //   }

  //   const weekStart = getMondayOfCurrentWeek();
  //   const weekEnd = getSundayOfCurrentWeek();

  //   const existing = await this.reportRepository.findOne({
  //     where: {
  //       authorId: user.id,
  //       weekStartDate: weekStart as any,
  //     },
  //   });
  //   if (existing) {
  //     throw new ConflictException(
  //       'You already have a report for this week. Edit that one instead.',
  //     );
  //   }

  //   const report = this.reportRepository.create({
  //     authorId: user.id,
  //     projectId: dto.projectId,
  //     weekStartDate: weekStart,
  //     weekEndDate: weekEnd,
  //     status: ReportStatus.DRAFT,
  //     hoursDevelopment: 0,
  //     hoursTesting: 0,
  //     hoursMeetings: 0,
  //     hoursDocumentation: 0,
  //   });

  //   return this.reportRepository.save(report);
  // }
  async createDraft(user: User, dto: CreateReportDto): Promise<Report> {
    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId, isActive: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found or inactive');
    }

    let weekStart: Date;
    let weekEnd: Date;

    if (dto.weekStart) {
      // User specified a week - validate it's past or current, must be a Monday
      const requestedMonday = new Date(dto.weekStart + 'T00:00:00');
      if (isNaN(requestedMonday.getTime())) {
        throw new BadRequestException('Invalid weekStart date');
      }
      if (requestedMonday.getDay() !== 1) {
        throw new BadRequestException(
          'weekStart must be a Monday (YYYY-MM-DD)',
        );
      }
      const currentMonday = getMondayOfCurrentWeek();
      if (requestedMonday.getTime() > currentMonday.getTime()) {
        throw new BadRequestException(
          'Cannot create a report for a future week',
        );
      }
      weekStart = requestedMonday;
      const sunday = new Date(requestedMonday);
      sunday.setDate(requestedMonday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      weekEnd = sunday;
    } else {
      weekStart = getMondayOfCurrentWeek();
      weekEnd = getSundayOfCurrentWeek();
    }

    const existing = await this.reportRepository.findOne({
      where: {
        authorId: user.id,
        weekStartDate: weekStart as any,
      },
    });
    if (existing) {
      throw new ConflictException(
        'You already have a report for this week. Edit that one instead.',
      );
    }

    const report = this.reportRepository.create({
      authorId: user.id,
      projectId: dto.projectId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      status: ReportStatus.DRAFT,
      hoursDevelopment: 0,
      hoursTesting: 0,
      hoursMeetings: 0,
      hoursDocumentation: 0,
    });

    return this.reportRepository.save(report);
  }

  async getBackfillableWeeks(_user: User): Promise<string[]> {
    // Return last 12 weeks (excluding current)
    const currentMonday = getMondayOfCurrentWeek();
    const eligibleWeeks: string[] = [];

    for (let i = 1; i <= 12; i++) {
      const monday = new Date(currentMonday);
      monday.setDate(currentMonday.getDate() - i * 7);
      eligibleWeeks.push(formatDateOnly(monday));
    }

    return eligibleWeeks;
  }

  async updateContent(
    user: User,
    reportId: string,
    dto: UpdateReportDto,
  ): Promise<Report> {
    const report = await this.findByIdOrThrow(reportId);

    if (report.authorId !== user.id) {
      throw new ForbiddenException('You can only edit your own reports');
    }

    if (
      report.status !== ReportStatus.DRAFT &&
      report.status !== ReportStatus.NEEDS_CORRECTION
    ) {
      throw new BadRequestException(
        'This report can only be edited while in Draft or Needs Correction status',
      );
    }

    this.enforceSingleKeyFlag(dto.blockers, 'blockers');
    this.enforceSingleKeyFlag(dto.achievements, 'achievements');

    await this.dataSource.transaction(async (manager) => {
      if (dto.tasks !== undefined) {
        await manager.delete(Task, { reportId });
        const newTasks = dto.tasks.map((t) =>
          manager.create(Task, { ...t, reportId }),
        );
        await manager.save(newTasks);
      }

      if (dto.blockers !== undefined) {
        await manager.delete(Blocker, { reportId });
        const newBlockers = dto.blockers.map((b) =>
          manager.create(Blocker, { ...b, reportId }),
        );
        await manager.save(newBlockers);
      }

      if (dto.achievements !== undefined) {
        await manager.delete(Achievement, { reportId });
        const newAchievements = dto.achievements.map((a) =>
          manager.create(Achievement, { ...a, reportId }),
        );
        await manager.save(newAchievements);
      }

      const partial: Partial<Report> = {};
      if (dto.tasksPlannedNextWeek !== undefined)
        partial.tasksPlannedNextWeek = dto.tasksPlannedNextWeek;
      if (dto.notes !== undefined) partial.notes = dto.notes;
      if (dto.hoursDevelopment !== undefined)
        partial.hoursDevelopment = dto.hoursDevelopment;
      if (dto.hoursTesting !== undefined)
        partial.hoursTesting = dto.hoursTesting;
      if (dto.hoursMeetings !== undefined)
        partial.hoursMeetings = dto.hoursMeetings;
      if (dto.hoursDocumentation !== undefined)
        partial.hoursDocumentation = dto.hoursDocumentation;

      if (Object.keys(partial).length > 0) {
        await manager.update(Report, reportId, partial);
      }
    });

    const updated = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['project', 'tasks', 'blockers', 'achievements'],
    });

    if (!updated) {
      throw new NotFoundException('Report not found after update');
    }

    return updated;
  }

  async submit(user: User, reportId: string): Promise<Report> {
    const report = await this.findByIdOrThrow(reportId);

    if (report.authorId !== user.id) {
      throw new ForbiddenException('You can only submit your own reports');
    }

    if (
      report.status !== ReportStatus.DRAFT &&
      report.status !== ReportStatus.NEEDS_CORRECTION
    ) {
      throw new BadRequestException(
        `Cannot submit report in ${report.status} status`,
      );
    }

    report.status = ReportStatus.SUBMITTED;
    report.submittedAt = new Date();
    return this.reportRepository.save(report);
  }

  async review(
    reviewer: User,
    reportId: string,
    dto: ReviewReportDto,
  ): Promise<Report> {
    const report = await this.findByIdOrThrow(reportId);

    if (report.status !== ReportStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted reports can be reviewed');
    }

    const newStatus =
      dto.actionType === ReviewActionType.APPROVED
        ? ReportStatus.APPROVED
        : ReportStatus.NEEDS_CORRECTION;

    await this.dataSource.transaction(async (manager) => {
      const action = manager.create(ReviewAction, {
        reportId,
        reviewerId: reviewer.id,
        actionType: dto.actionType,
        comment: dto.comment || null,
      });
      await manager.save(action);

      const updateData: Partial<Report> = {
        status: newStatus,
        reviewedAt: new Date(),
      };
      if (dto.actionType === ReviewActionType.REQUESTED_CHANGES) {
        updateData.latestReviewComment = dto.comment;
      } else {
        updateData.latestReviewComment = null;
      }
      await manager.update(Report, reportId, updateData);
    });

    const updated = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: [
        'project',
        'tasks',
        'blockers',
        'achievements',
        'reviewActions',
        'reviewActions.reviewer',
      ],
    });

    if (!updated) {
      throw new NotFoundException('Report not found after review');
    }

    return updated;
  }

  async getCurrentWeekReport(user: User): Promise<Report | null> {
    const weekStart = getMondayOfCurrentWeek();
    return this.reportRepository.findOne({
      where: {
        authorId: user.id,
        weekStartDate: weekStart as any,
      },
      relations: ['project', 'tasks', 'blockers', 'achievements'],
    });
  }

  async listOwnReports(user: User, dto: ListReportsDto) {
    return this.buildList({ ...dto, authorId: user.id });
  }

  async listAllReports(dto: ListReportsDto) {
    const filters = { ...dto };
    return this.buildList(filters, true);
  }

  async findOne(user: User, reportId: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: [
        'author',
        'project',
        'tasks',
        'blockers',
        'achievements',
        'reviewActions',
        'reviewActions.reviewer',
      ],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const isOwner = report.authorId === user.id;
    const isPrivilegedRole =
      user.role === UserRole.MANAGER || user.role === UserRole.ADMIN;

    if (!isOwner && !isPrivilegedRole) {
      throw new ForbiddenException('You cannot view this report');
    }

    if (!isOwner && report.status === ReportStatus.DRAFT) {
      throw new ForbiddenException('Drafts are private to their author');
    }

    return report;
  }

  async deleteDraft(user: User, reportId: string): Promise<void> {
    const report = await this.findByIdOrThrow(reportId);

    if (report.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own reports');
    }

    if (report.status !== ReportStatus.DRAFT) {
      throw new BadRequestException('Only drafts can be deleted');
    }

    await this.reportRepository.delete(reportId);
  }

  private async findByIdOrThrow(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  private enforceSingleKeyFlag(
    items: Array<{ isKey: boolean }> | undefined,
    label: string,
  ): void {
    if (!items) return;
    const keyCount = items.filter((i) => i.isKey).length;
    if (keyCount > 1) {
      throw new BadRequestException(
        `Only one ${label.slice(0, -1)} can be flagged as key`,
      );
    }
  }

  private async buildList(
    filters: ListReportsDto,
    excludeDrafts = false,
  ): Promise<{
    items: Report[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.author', 'author')
      .leftJoinAndSelect('report.project', 'project')
      .orderBy('report.weekStartDate', 'DESC')
      .addOrderBy('report.updatedAt', 'DESC');

    if (excludeDrafts) {
      query.andWhere('report.status != :draftStatus', {
        draftStatus: ReportStatus.DRAFT,
      });
    }

    if (filters.authorId) {
      query.andWhere('report.authorId = :authorId', {
        authorId: filters.authorId,
      });
    }

    if (filters.projectId) {
      query.andWhere('report.projectId = :projectId', {
        projectId: filters.projectId,
      });
    }

    if (filters.status) {
      query.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters.weekStart) {
      query.andWhere('report.weekStartDate >= :weekStart', {
        weekStart: filters.weekStart,
      });
    }

    if (filters.weekEnd) {
      query.andWhere('report.weekEndDate <= :weekEnd', {
        weekEnd: filters.weekEnd,
      });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
