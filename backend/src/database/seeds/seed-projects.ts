import { DataSource } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { SEED_PROJECTS } from './seed-data';

export async function seedProjects(dataSource: DataSource): Promise<number> {
  const projectRepository = dataSource.getRepository(Project);

  console.log('📁 Seeding projects...');

  for (const seedProject of SEED_PROJECTS) {
    const project = projectRepository.create({
      name: seedProject.name,
      description: seedProject.description,
      isActive: true,
    });

    await projectRepository.save(project);
  }

  console.log(`✓ Seeded ${SEED_PROJECTS.length} projects`);
  return SEED_PROJECTS.length;
}
