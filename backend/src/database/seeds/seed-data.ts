import { UserRole } from '../../entities/user.entity';

export interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const SEED_USERS: SeedUser[] = [
  {
    name: 'Dulya De Costa',
    email: 'dulya@sisenco.com',
    password: 'Dulya@123',
    role: UserRole.ADMIN,
  },
  {
    name: 'Tharindu Mallawaarachchi',
    email: 'tharindu@sisenco.com',
    password: 'Tharindu@123',
    role: UserRole.MANAGER,
  },
  {
    name: 'Pooja Malagala',
    email: 'pooja@sisenco.com',
    password: 'Pooja@123',
    role: UserRole.MANAGER,
  },
  {
    name: 'Nihithi Kevinya',
    email: 'nihithi@sisenco.com',
    password: 'Nihithi@123',
    role: UserRole.MEMBER,
  },
  {
    name: 'Siluni Kannangara',
    email: 'siluni@sisenco.com',
    password: 'Siluni@123',
    role: UserRole.MEMBER,
  },
  {
    name: 'Maleesha Rajapaksha',
    email: 'maleesha@sisenco.com',
    password: 'Maleesha@123',
    role: UserRole.MEMBER,
  },
];

export interface SeedProject {
  name: string;
  description: string;
}

export const SEED_PROJECTS: SeedProject[] = [
  {
    name: 'Client Alpha',
    description: 'Enterprise client engagement for Alpha corporation',
  },
  {
    name: 'Client Beta',
    description: 'Ongoing consulting work for Beta Ltd',
  },
  {
    name: 'Internal Tooling',
    description: 'Development of internal tools and automation',
  },
  {
    name: 'R&D',
    description: 'Research and development initiatives',
  },
  {
    name: 'Marketing',
    description: 'Marketing collateral and campaign support',
  },
];
