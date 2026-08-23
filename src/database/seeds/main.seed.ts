import { AppDataSource } from '../data-source';
import { PermissionsSeeder } from './seeders/01-permissions.seeder';
import { RolesSeeder } from './seeders/02-roles.seeder';
import { BranchesSeeder } from './seeders/03-branches.seeder';
import { AdminUsersSeeder } from './seeders/04-admin-users.seeder';

export async function runMainSeed() {
  console.log('🌱 Starting Enterprise E-Commerce Seed Orchestrator...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection initialized successfully.');

    // 1. Seed Granular Permissions
    const permissionMap = await new PermissionsSeeder().run(AppDataSource);

    // 2. Seed Dynamic Roles & Permission Mappings
    const roleMap = await new RolesSeeder().run(AppDataSource, permissionMap);

    // 3. Seed Store Branches
    const branchMap = await new BranchesSeeder().run(AppDataSource);

    // 4. Seed Staff & Admin Users linked to Roles & Branches
    await new AdminUsersSeeder().run(AppDataSource, roleMap, branchMap);

    console.log('🎉 Enterprise RBAC & System Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Error during data seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

runMainSeed();
