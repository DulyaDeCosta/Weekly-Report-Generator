import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from '../entities/report.entity';
import { User } from '../entities/user.entity';
import {
  getMondayOfCurrentWeek,
  getSundayOfCurrentWeek,
  formatDateOnly,
} from '../reports/utils/week.util';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

export interface DashboardStats {
  metrics: {
    reportsThisWeek: number;
    awaitingReview: number;
    approvedThisWeek: number;
    activeMembers: number;
    needsCorrection: number;
    openBlockers: number;
  };
  statusDistribution: Array<{ status: string; count: number }>;
  reportsByMember: Array<{ memberName: string; count: number }>;
  hoursBreakdown: {
    development: number;
    testing: number;
    meetings: number;
    documentation: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStats(query: DashboardQueryDto): Promise<DashboardStats> {
    const weekStart = query.weekStart
      ? new Date(query.weekStart + 'T00:00:00')
      : getMondayOfCurrentWeek();
    const weekEnd = query.weekEnd
      ? new Date(query.weekEnd + 'T23:59:59')
      : getSundayOfCurrentWeek();

    const weekStartStr = formatDateOnly(weekStart);
    const weekEndStr = formatDateOnly(weekEnd);

    // Build base filter conditions
    const buildQuery = (excludeDrafts = true) => {
      const qb = this.reportRepository
        .createQueryBuilder('report')
        .leftJoin('report.author', 'author')
        .where('report.weekStartDate >= :weekStart', {
          weekStart: weekStartStr,
        })
        .andWhere('report.weekStartDate <= :weekEnd', { weekEnd: weekEndStr });

      if (excludeDrafts) {
        qb.andWhere('report.status != :draftStatus', {
          draftStatus: ReportStatus.DRAFT,
        });
      }
      if (query.projectId) {
        qb.andWhere('report.projectId = :projectId', {
          projectId: query.projectId,
        });
      }
      return qb;
    };

    // Metric 1: total reports in period (non-draft)
    const reportsThisWeek = await buildQuery().getCount();

    // Metric 2: awaiting review
    const awaitingReview = await buildQuery()
      .andWhere('report.status = :submitted', {
        submitted: ReportStatus.SUBMITTED,
      })
      .getCount();

    // Metric 3: approved this week
    const approvedThisWeek = await buildQuery()
      .andWhere('report.status = :approved', {
        approved: ReportStatus.APPROVED,
      })
      .getCount();

    // Metric 4: active members (total active users)
    const activeMembers = await this.userRepository.count({
      where: { isActive: true },
    });

    // Metric 5: needs correction (compliance issue count)
    const needsCorrection = await buildQuery()
      .andWhere('report.status = :needsCorrection', {
        needsCorrection: ReportStatus.NEEDS_CORRECTION,
      })
      .getCount();

    // Metric 6: open blockers across the team (from non-draft reports in period)
    const blockersRaw = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoin('report.blockers', 'blocker')
      .select('COUNT(blocker.id)', 'count')
      .where('report.weekStartDate >= :weekStart', { weekStart: weekStartStr })
      .andWhere('report.weekStartDate <= :weekEnd', { weekEnd: weekEndStr })
      .andWhere('report.status != :draftStatus', {
        draftStatus: ReportStatus.DRAFT,
      });

    if (query.projectId) {
      blockersRaw.andWhere('report.projectId = :projectId', {
        projectId: query.projectId,
      });
    }

    const blockersResult = await blockersRaw.getRawOne();
    const openBlockers = parseInt(blockersResult?.count ?? '0', 10);

    // Chart 1: status distribution
    const statusRaw = await buildQuery()
      .select('report.status', 'status')
      .addSelect('COUNT(report.id)', 'count')
      .groupBy('report.status')
      .getRawMany();
    const statusDistribution = statusRaw.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));

    // Chart 2: reports per member
    const memberRaw = await buildQuery()
      .select('author.name', 'memberName')
      .addSelect('COUNT(report.id)', 'count')
      .groupBy('author.id')
      .addGroupBy('author.name')
      .orderBy('count', 'DESC')
      .getRawMany();
    const reportsByMember = memberRaw.map((r) => ({
      memberName: r.memberName,
      count: parseInt(r.count, 10),
    }));

    // Chart 3: hours breakdown (sum across all reports in period)
    const hoursRaw = await buildQuery()
      .select('SUM(report.hoursDevelopment)', 'dev')
      .addSelect('SUM(report.hoursTesting)', 'testing')
      .addSelect('SUM(report.hoursMeetings)', 'meetings')
      .addSelect('SUM(report.hoursDocumentation)', 'documentation')
      .getRawOne();
    const hoursBreakdown = {
      development: parseInt(hoursRaw?.dev ?? '0', 10),
      testing: parseInt(hoursRaw?.testing ?? '0', 10),
      meetings: parseInt(hoursRaw?.meetings ?? '0', 10),
      documentation: parseInt(hoursRaw?.documentation ?? '0', 10),
    };

    return {
      metrics: {
        reportsThisWeek,
        awaitingReview,
        approvedThisWeek,
        activeMembers,
        needsCorrection,
        openBlockers,
      },
      statusDistribution,
      reportsByMember,
      hoursBreakdown,
    };
  }
}
