import 'reflect-metadata';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/user.entity';
import { Project } from '../../entities/project.entity';
import { seedUsers } from './seed-users';
import { seedProjects } from './seed-projects';
import { SEED_USERS } from './seed-data';

async function main() {
  const isFresh = process.argv.includes('--fresh');

  console.log('Starting database seed...\n');

  try {
    await AppDataSource.initialize();
    console.log('✓ Connected to database');

    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(Project);

    const existingUsers = await userRepository.count();
    const existingProjects = await projectRepository.count();

    if (existingUsers > 0 || existingProjects > 0) {
      if (!isFresh) {
        console.log(
          `\n⚠  Database already contains data (${existingUsers} users, ${existingProjects} projects).`,
        );
        console.log('   Use "npm run seed:fresh" to wipe and re-seed.\n');
        await AppDataSource.destroy();
        process.exit(0);
      }

      await projectRepository.query('DELETE FROM projects');
      await userRepository.query('DELETE FROM users');
      console.log('✓ Cleared existing users and projects');
    }

    const userCount = await seedUsers(AppDataSource);
    const projectCount = await seedProjects(AppDataSource);

    const adminCount = SEED_USERS.filter((u) => u.role === 'ADMIN').length;
    const managerCount = SEED_USERS.filter((u) => u.role === 'MANAGER').length;
    const memberCount = SEED_USERS.filter((u) => u.role === 'MEMBER').length;

    console.log('\n✅ Seed complete!\n');
    console.log('Summary:');
    console.log(
      `  Users:    ${userCount} (${adminCount} admin, ${managerCount} managers, ${memberCount} members)`,
    );
    console.log(`  Projects: ${projectCount}\n`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:');
    console.error(error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

main();
