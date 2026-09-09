import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(includeInactive = false): Promise<Project[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.projectRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(data: { name: string; description?: string }): Promise<Project> {
    const existing = await this.projectRepository.findOne({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('A project with this name already exists');
    }

    const project = this.projectRepository.create({
      name: data.name,
      description: data.description ?? null,
      isActive: true,
    });
    return this.projectRepository.save(project);
  }

  async update(
    id: string,
    data: { name?: string; description?: string; isActive?: boolean },
  ): Promise<Project> {
    const project = await this.findOne(id);

    if (data.name && data.name !== project.name) {
      const existing = await this.projectRepository.findOne({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException('A project with this name already exists');
      }
    }

    Object.assign(project, data);
    return this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    project.isActive = false;
    await this.projectRepository.save(project);
  }
}
