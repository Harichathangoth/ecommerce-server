import { DataSource } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Role } from '../../../modules/roles/entities/role.entity';
import { Branch } from '../../../modules/branches/entities/branch.entity';
import usersData from '../fixtures/users.data.json';

export class AdminUsersSeeder {
  async run(
    dataSource: DataSource,
    roleMap: Map<string, Role>,
    branchMap: Map<string, Branch>,
  ): Promise<void> {
    console.log('  └─ 👥 Seeding Staff & Admin Users...');
    const userRepo = dataSource.getRepository(User);

    for (const data of usersData) {
      const existing = await userRepo.findOne({ where: { email: data.email } });
      const assignedRole = roleMap.get(data.role.toLowerCase());
      const assignedBranch = data.branchCode ? branchMap.get(data.branchCode) : null;

      if (!existing) {
        const newUser = userRepo.create({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          roleId: assignedRole ? assignedRole.id : null,
          branchId: assignedBranch ? assignedBranch.id : null,
        });
        await userRepo.save(newUser);
      }
    }

    console.log(`     ✅ ${usersData.length} Admin & Staff Users initialized.`);
  }
}
