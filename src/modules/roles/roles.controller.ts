import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SystemPermission } from '../../common/enums/permissions.enum';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller({ path: 'roles', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions(SystemPermission.ROLES_MANAGE, SystemPermission.USERS_READ)
  @ApiOperation({ summary: 'List all roles with attached permissions' })
  async findAllRoles(): Promise<Role[]> {
    return await this.rolesService.findAllRoles();
  }

  @Get('permissions')
  @Permissions(SystemPermission.ROLES_MANAGE)
  @ApiOperation({ summary: 'List all available system permissions' })
  async findAllPermissions(): Promise<Permission[]> {
    return await this.rolesService.findAllPermissions();
  }

  @Get(':id')
  @Permissions(SystemPermission.ROLES_MANAGE)
  @ApiOperation({ summary: 'Get role details by ID' })
  async findOneRole(@Param('id') id: string): Promise<Role> {
    return await this.rolesService.findRoleById(id);
  }

  @Post()
  @Permissions(SystemPermission.ROLES_MANAGE)
  @ApiOperation({ summary: 'Create new custom role with assigned permissions' })
  async createRole(
    @Body() dto: { name: string; slug: string; description?: string; permissionSlugs?: string[] },
  ): Promise<Role> {
    return await this.rolesService.createRole(dto);
  }

  @Patch(':id')
  @Permissions(SystemPermission.ROLES_MANAGE)
  @ApiOperation({ summary: 'Update custom role permissions or details' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: { name?: string; description?: string; permissionSlugs?: string[] },
  ): Promise<Role> {
    return await this.rolesService.updateRole(id, dto);
  }

  @Delete(':id')
  @Permissions(SystemPermission.ROLES_MANAGE)
  @ApiOperation({ summary: 'Delete custom role' })
  async removeRole(@Param('id') id: string): Promise<{ message: string }> {
    await this.rolesService.deleteRole(id);
    return { message: 'Role deleted successfully' };
  }
}
