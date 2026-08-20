import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get enterprise audit log history' })
  async findAll(): Promise<AuditLog[]> {
    return this.auditService.findAll();
  }
}
