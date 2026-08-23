import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';

@ApiTags('Branches')
@Controller({ path: 'branches', version: '1' })
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active physical store branches' })
  async findAll(): Promise<Branch[]> {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch details by ID' })
  async findOne(@Param('id') id: string): Promise<Branch> {
    return this.branchesService.findById(id);
  }
}
