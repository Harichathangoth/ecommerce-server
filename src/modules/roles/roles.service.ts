import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAllRoles(): Promise<Role[]> {
    try {
      return await this.roleRepository.find({
        relations: ['permissions'],
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch roles: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve roles directory');
    }
  }

  async findAllPermissions(): Promise<Permission[]> {
    try {
      return await this.permissionRepository.find({
        order: { group: 'ASC', slug: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch permissions: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve permissions directory');
    }
  }

  async findRoleById(id: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['permissions'],
      });
      if (!role) {
        throw new NotFoundException(`Role with ID "${id}" not found`);
      }
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to find role by ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve role details');
    }
  }

  async createRole(dto: {
    name: string;
    slug: string;
    description?: string;
    permissionSlugs?: string[];
  }): Promise<Role> {
    try {
      const existing = await this.roleRepository.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException(`Role with slug "${dto.slug}" already exists`);
      }

      let permissions: Permission[] = [];
      if (dto.permissionSlugs && dto.permissionSlugs.length > 0) {
        permissions = await this.permissionRepository.find({
          where: { slug: In(dto.permissionSlugs) },
        });
      }

      const newRole = this.roleRepository.create({
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isSystemRole: false,
        permissions,
      });

      return await this.roleRepository.save(newRole);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(`Failed to create role: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create custom role');
    }
  }

  async updateRole(
    id: string,
    dto: {
      name?: string;
      description?: string;
      permissionSlugs?: string[];
    },
  ): Promise<Role> {
    try {
      const role = await this.findRoleById(id);

      if (dto.name) role.name = dto.name;
      if (dto.description !== undefined) role.description = dto.description;

      if (dto.permissionSlugs) {
        role.permissions = await this.permissionRepository.find({
          where: { slug: In(dto.permissionSlugs) },
        });
      }

      return await this.roleRepository.save(role);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to update role with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update role details');
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const role = await this.findRoleById(id);
      if (role.isSystemRole) {
        throw new ForbiddenException(`System role "${role.name}" cannot be deleted`);
      }
      await this.roleRepository.remove(role);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      this.logger.error(`Failed to delete role with ID "${id}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete role');
    }
  }
}
