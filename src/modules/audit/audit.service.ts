import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
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
    const entry = this.auditRepository.create(data);
    return this.auditRepository.save(entry);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }
}
