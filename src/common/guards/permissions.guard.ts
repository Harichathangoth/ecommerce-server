import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Access Denied: User role permissions context missing.');
    }

    // Super Admin bypass: super_admin slug automatically grants all permissions
    if (user.role.slug === 'super_admin' || user.role === 'SUPER_ADMIN') {
      return true;
    }

    const permissions = user.role.permissions || [];
    const userPermissionSlugs = permissions.map((p: any) => p.slug || p);

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissionSlugs.includes(perm)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient Permissions. Required permissions: [${requiredPermissions.join(', ')}].`
      );
    }

    return true;
  }
}
