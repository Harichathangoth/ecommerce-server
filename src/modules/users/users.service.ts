import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(roleId?: string, branchId?: string): Promise<User[]> {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('role.permissions', 'permissions')
        .leftJoinAndSelect('user.branch', 'branch');

      if (roleId) {
        query.andWhere('user.roleId = :roleId', { roleId });
      }
      if (branchId) {
        query.andWhere('user.branchId = :branchId', { branchId });
      }
      query.orderBy('user.createdAt', 'DESC');
      return await query.getMany();
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role', 'role.permissions', 'branch'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding user by ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Database query failed while retrieving user details');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email },
        relations: ['role', 'role.permissions', 'branch'],
      });
    } catch (error) {
      this.logger.error(`Error finding user by email "${email}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Database error while querying email');
    }
  }

  async createUser(dto: Partial<User>): Promise<User> {
    try {
      const existing = await this.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException(`User with email "${dto.email}" already exists`);
      }

      const newUser = this.userRepository.create({
        email: dto.email,
        password: dto.password || 'DefaultPass123!',
        fullName: dto.fullName,
        phone: dto.phone,
        roleId: dto.roleId || null,
        branchId: dto.branchId || null,
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create user record');
    }
  }

  async updateUser(id: string, dto: Partial<User>): Promise<User> {
    try {
      const user = await this.findById(id);
      Object.assign(user, dto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to update user with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update user details');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      await this.userRepository.remove(user);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to delete user with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete user account');
    }
  }
}
