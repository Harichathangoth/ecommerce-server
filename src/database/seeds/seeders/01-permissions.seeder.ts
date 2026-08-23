import { DataSource } from 'typeorm';
import { Permission } from '../../../modules/roles/entities/permission.entity';
import permissionsData from '../fixtures/permissions.data.json';

export class PermissionsSeeder {
  async run(dataSource: DataSource): Promise<Map<string, Permission>> {
    console.log('  └─ 🔑 Seeding Granular System Permissions...');
    const permissionRepo = dataSource.getRepository(Permission);
    const permissionMap = new Map<string, Permission>();

    for (const data of permissionsData) {
      let perm = await permissionRepo.findOne({ where: { slug: data.slug } });
      if (!perm) {
        perm = permissionRepo.create({
          slug: data.slug,
          name: data.name,
          group: data.group,
          description: data.description,
        });
        perm = await permissionRepo.save(perm);
      }
      permissionMap.set(data.slug, perm);
    }

    console.log(`     ✅ ${permissionsData.length} Granular Permissions initialized.`);
    return permissionMap;
  }
}
