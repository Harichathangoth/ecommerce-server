import { DataSource } from 'typeorm';
import { Role } from '../../../modules/roles/entities/role.entity';
import { Permission } from '../../../modules/roles/entities/permission.entity';
import rolesData from '../fixtures/roles.data.json';

export class RolesSeeder {
  async run(
    dataSource: DataSource,
    permissionMap: Map<string, Permission>,
  ): Promise<Map<string, Role>> {
    console.log('  └─ 🛡️ Seeding System Roles & Permission Associations...');
    const roleRepo = dataSource.getRepository(Role);
    const roleMap = new Map<string, Role>();

    for (const data of rolesData) {
      let role = await roleRepo.findOne({ where: { slug: data.slug } });

      const attachedPermissions: Permission[] = [];
      for (const slug of data.permissionSlugs) {
        const perm = permissionMap.get(slug);
        if (perm) {
          attachedPermissions.push(perm);
        }
      }

      if (!role) {
        role = roleRepo.create({
          name: data.name,
          slug: data.slug,
          isSystemRole: data.isSystemRole,
          description: data.description,
          permissions: attachedPermissions,
        });
        role = await roleRepo.save(role);
      } else {
        role.permissions = attachedPermissions;
        role = await roleRepo.save(role);
      }

      roleMap.set(data.slug, role);
    }

    console.log(`     ✅ ${rolesData.length} System Roles initialized & mapped.`);
    return roleMap;
  }
}
