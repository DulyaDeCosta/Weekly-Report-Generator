import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';
import { ListReportsDto } from './dto/list-reports.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createDraft(user, dto);
  }

  @Get('me/current')
  async getMyCurrent(@CurrentUser() user: User) {
    return this.reportsService.getCurrentWeekReport(user);
  }

  @Get('me')
  async listMine(
    @CurrentUser() user: User,
    @Query() dto: ListReportsDto,
  ) {
    return this.reportsService.listOwnReports(user, dto);
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async listAll(@Query() dto: ListReportsDto) {
    return this.reportsService.listAllReports(dto);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportsService.findOne(user, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportsService.updateContent(user, id, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportsService.submit(user, id);
  }

  @Post(':id/review')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async review(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewReportDto,
  ) {
    return this.reportsService.review(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportsService.deleteDraft(user, id);
  }
}
