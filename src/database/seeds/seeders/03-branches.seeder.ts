import { DataSource } from 'typeorm';
import { Branch } from '../../../modules/branches/entities/branch.entity';
import branchesData from '../fixtures/branches.data.json';

export class BranchesSeeder {
  async run(dataSource: DataSource): Promise<Map<string, Branch>> {
    console.log('  └─ 🏬 Seeding Store Branches...');
    const branchRepo = dataSource.getRepository(Branch);
    const branchMap = new Map<string, Branch>();

    for (const data of branchesData) {
      let branch = await branchRepo.findOne({ where: { code: data.code } });
      if (!branch) {
        branch = branchRepo.create({
          code: data.code,
          name: data.name,
          address: data.address,
          city: data.city || 'Main City',
          phone: data.phone,
          isActive: data.isActive,
        });
        branch = await branchRepo.save(branch);
      }
      branchMap.set(data.code, branch);
    }

    console.log(`     ✅ ${branchesData.length} Store Branches initialized.`);
    return branchMap;
  }
}
