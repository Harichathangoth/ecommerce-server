import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    try {
      return await this.branchRepository.find({ where: { isActive: true } });
    } catch (error) {
      this.logger.error(`Failed to fetch active branches: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve branch directory');
    }
  }

  async findById(id: string): Promise<Branch> {
    try {
      const branch = await this.branchRepository.findOne({ where: { id } });
      if (!branch) {
        throw new NotFoundException(`Branch with ID "${id}" not found`);
      }
      return branch;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding branch by ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Database query failed while retrieving branch');
    }
  }
}
