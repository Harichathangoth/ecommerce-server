import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SystemPermission } from '../../common/enums/permissions.enum';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(SystemPermission.USERS_READ)
  @ApiOperation({ summary: 'List users with optional roleId and branchId filter' })
  async findAll(
    @Query('roleId') roleId?: string,
    @Query('branchId') branchId?: string,
  ): Promise<User[]> {
    return await this.usersService.findAll(roleId, branchId);
  }

  @Get(':id')
  @Permissions(SystemPermission.USERS_READ)
  @ApiOperation({ summary: 'Get user details by ID' })
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findById(id);
  }

  @Post()
  @Permissions(SystemPermission.USERS_CREATE)
  @ApiOperation({ summary: 'Create new user/staff member' })
  async create(@Body() dto: Partial<User>): Promise<User> {
    return await this.usersService.createUser(dto);
  }

  @Patch(':id')
  @Permissions(SystemPermission.USERS_UPDATE)
  @ApiOperation({ summary: 'Update user/staff record' })
  async update(@Param('id') id: string, @Body() dto: Partial<User>): Promise<User> {
    return await this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @Permissions(SystemPermission.USERS_DELETE)
  @ApiOperation({ summary: 'Delete user account' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
