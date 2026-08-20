import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({ relations: ['branch'] });
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['branch'],
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
        relations: ['branch'],
      });
    } catch (error) {
      this.logger.error(`Error finding user by email "${email}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Database error while querying email');
    }
  }
}
