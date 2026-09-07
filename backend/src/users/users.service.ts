import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

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

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(data: {
    name: string;
    email: string;
    hashedPassword: string;
    role?: UserRole;
  }): Promise<User> {
    const emailLower = data.email.toLowerCase();

    const existing = await this.findByEmail(emailLower);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepository.create({
      name: data.name,
      email: emailLower,
      password: data.hashedPassword,
      role: data.role ?? UserRole.MEMBER,
    });

    return this.userRepository.save(user);
  }
}
