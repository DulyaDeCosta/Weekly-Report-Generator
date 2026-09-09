import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { User, UserRole } from '../src/entities/user.entity';
import { Report, ReportStatus } from '../src/entities/report.entity';
import { Project } from '../src/entities/project.entity';
import { Task } from '../src/entities/task.entity';
import { Blocker } from '../src/entities/blocker.entity';
import { Achievement } from '../src/entities/achievement.entity';
import { ReviewAction } from '../src/entities/review-action.entity';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';


describe('RBAC (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  // Mock users for token generation
  const memberUser = {
    id: 'member-uuid-1',
    email: 'member@test.com',
    name: 'Test Member',
    role: UserRole.MEMBER,
    isActive: true,
  };

  const managerUser = {
    id: 'manager-uuid-1',
    email: 'manager@test.com',
    name: 'Test Manager',
    role: UserRole.MANAGER,
    isActive: true,
  };

  const adminUser = {
    id: 'admin-uuid-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: UserRole.ADMIN,
    isActive: true,
  };

  // Mock repository factory — returns a repository-like object with common methods
  const createMockRepository = () => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    findBy: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    delete: jest.fn().mockResolvedValue({ affected: 0 }),
    count: jest.fn().mockResolvedValue(0),
    query: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn(() => ({
      leftJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({}),
      getCount: jest.fn().mockResolvedValue(0),
    })),
  });

  beforeAll(async () => {
    const userRepoMock = createMockRepository();

    // Configure findOne to return the correct user based on JWT payload
    userRepoMock.findOne.mockImplementation((options: any) => {
      const id = options?.where?.id;
      if (id === memberUser.id) return Promise.resolve(memberUser);
      if (id === managerUser.id) return Promise.resolve(managerUser);
      if (id === adminUser.id) return Promise.resolve(adminUser);
      return Promise.resolve(null);
    });

    // Reports repo mock — returns a report owned by memberUser for RBAC checks
    const reportsRepoMock = createMockRepository();
    reportsRepoMock.findOne.mockImplementation((options: any) => {
      const id = options?.where?.id;
      if (id === 'report-owned-by-member') {
        return Promise.resolve({
          id: 'report-owned-by-member',
          authorId: memberUser.id,
          status: ReportStatus.APPROVED,
          tasks: [],
          blockers: [],
          achievements: [],
          reviewActions: [],
        });
      }
      return Promise.resolve(null);
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override all repository providers with mocks
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepoMock)
      .overrideProvider(getRepositoryToken(Report))
      .useValue(reportsRepoMock)
      .overrideProvider(getRepositoryToken(Project))
      .useValue(createMockRepository())
      .overrideProvider(getRepositoryToken(Task))
      .useValue(createMockRepository())
      .overrideProvider(getRepositoryToken(Blocker))
      .useValue(createMockRepository())
      .overrideProvider(getRepositoryToken(Achievement))
      .useValue(createMockRepository())
      .overrideProvider(getRepositoryToken(ReviewAction))
      .useValue(createMockRepository())
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    jwtService = app.get(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const tokenFor = (user: typeof memberUser) =>
    jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

  describe('Unauthenticated access', () => {
    it('should reject GET /api/reports/me without a token (401)', async () => {
      await request(app.getHttpServer())
        .get('/api/reports/me')
        .expect(401);
    });

    it('should reject GET /api/users without a token (401)', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });
  });

  describe('MEMBER role restrictions', () => {
    it('should reject GET /api/reports (manager-only) with MEMBER token (403)', async () => {
      const token = tokenFor(memberUser);
      await request(app.getHttpServer())
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should reject GET /api/users (manager/admin-only) with MEMBER token (403)', async () => {
      const token = tokenFor(memberUser);
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should reject POST /api/projects (manager/admin-only) with MEMBER token (403)', async () => {
      const token = tokenFor(memberUser);
      await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Should Fail' })
        .expect(403);
    });

    it('should reject GET /api/dashboard/stats (manager/admin-only) with MEMBER token (403)', async () => {
      const token = tokenFor(memberUser);
      await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('MANAGER role restrictions', () => {
    it('should allow GET /api/reports with MANAGER token (200)', async () => {
      const token = tokenFor(managerUser);
      await request(app.getHttpServer())
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should reject POST /api/users (admin-only) with MANAGER token (403)', async () => {
      const token = tokenFor(managerUser);
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New User',
          email: 'new@test.com',
          password: 'Password123',
          role: 'MEMBER',
        })
        .expect(403);
    });

    it('should reject DELETE /api/users/:id (admin-only) with MANAGER token (403)', async () => {
      const token = tokenFor(managerUser);
      await request(app.getHttpServer())
        .delete('/api/users/00000000-0000-0000-0000-000000000001')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('ADMIN role permissions', () => {
    it('should allow GET /api/users with ADMIN token (200)', async () => {
      const token = tokenFor(adminUser);
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should allow GET /api/reports with ADMIN token (200)', async () => {
      const token = tokenFor(adminUser);
      await request(app.getHttpServer())
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should allow GET /api/dashboard/stats with ADMIN token (200)', async () => {
      const token = tokenFor(adminUser);
      await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
