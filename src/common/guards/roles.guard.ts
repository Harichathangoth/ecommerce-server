import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('User role context is missing');
    }

    // Support both string role and dynamic Role object with slug/name
    const userRoleSlug = typeof user.role === 'object' ? user.role.slug : user.role;
    const userRoleName = typeof user.role === 'object' ? user.role.name : user.role;

    // Super Admin override
    if (userRoleSlug === 'super_admin' || userRoleSlug === Role.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.some(
      (role) =>
        role === userRoleSlug ||
        role === userRoleName ||
        role.toLowerCase() === String(userRoleSlug).toLowerCase()
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: [${requiredRoles.join(', ')}]. Your role: ${userRoleSlug}`
      );
    }

    return true;
  }
}
