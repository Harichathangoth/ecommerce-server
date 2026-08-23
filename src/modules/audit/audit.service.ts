import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(data: {
    userId?: string;
    action: string;
    entityName: string;
    entityId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    try {
      const entry = this.auditRepository.create(data);
      return await this.auditRepository.save(entry);
    } catch (error) {
      this.logger.error(`Failed to record audit log entry: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to record system audit log');
    }
  }

  async findAll(): Promise<AuditLog[]> {
    try {
      return await this.auditRepository.find({
        order: { timestamp: 'DESC' },
        take: 100,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch audit logs: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve audit log records');
    }
  }
}
