import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { SEED_USERS } from './seed-data';

const BCRYPT_ROUNDS = 10;

export async function seedUsers(dataSource: DataSource): Promise<number> {
  const userRepository = dataSource.getRepository(User);

  console.log('👥 Seeding users...');

  for (const seedUser of SEED_USERS) {
    const hashedPassword = await bcrypt.hash(seedUser.password, BCRYPT_ROUNDS);

    const user = userRepository.create({
      name: seedUser.name,
      email: seedUser.email.toLowerCase(),
      password: hashedPassword,
      role: seedUser.role,
      isActive: true,
    });

    await userRepository.save(user);
  }

  console.log(`✓ Seeded ${SEED_USERS.length} users`);
  return SEED_USERS.length;
}
