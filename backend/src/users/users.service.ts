import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
      select: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    const emailLower = data.email.toLowerCase();
    const existing = await this.userRepository.findOne({
      where: { email: emailLower },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = this.userRepository.create({
      name: data.name,
      email: emailLower,
      password: hashedPassword,
      role: data.role,
      isActive: true,
    });

    const saved = await this.userRepository.save(user);
    // Do not return the password hash
    const { password: _password, ...safeUser } = saved;
    return safeUser as User;
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: UserRole;
      isActive?: boolean;
    },
    actingUser: User,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isSelf = actingUser.id === user.id;

    // Prevent admin from demoting themselves
    if (isSelf && data.role && data.role !== user.role) {
      throw new BadRequestException('You cannot change your own role');
    }

    // Prevent admin from deactivating themselves
    if (isSelf && data.isActive === false) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    // Email uniqueness check if being changed
    if (data.email && data.email.toLowerCase() !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: data.email.toLowerCase() },
      });
      if (existing) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      data.email = data.email.toLowerCase();
    }

    Object.assign(user, data);
    const saved = await this.userRepository.save(user);
    const { password: _password, ...safeUser } = saved;
    return safeUser as User;
  }
  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async remove(id: string, actingUser: User): Promise<void> {
    if (id === actingUser.id) {
      throw new BadRequestException('You cannot deactivate your own account');
    }
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    await this.userRepository.save(user);
  }
}
