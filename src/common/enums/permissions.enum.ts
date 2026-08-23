export enum SystemPermission {
  // User & Staff Management
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Roles & Permissions Management
  ROLES_MANAGE = 'roles:manage',

  // Product Catalog
  PRODUCTS_READ = 'products:read',
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_UPDATE = 'products:update',
  PRODUCTS_DELETE = 'products:delete',

  // Inventory & Transfers
  INVENTORY_READ = 'inventory:read',
  INVENTORY_UPDATE = 'inventory:update',
  TRANSFERS_INITIATE = 'transfers:initiate',
  TRANSFERS_APPROVE = 'transfers:approve',

  // Customer Orders
  ORDERS_READ = 'orders:read',
  ORDERS_DISPATCH = 'orders:dispatch',
  ORDERS_REFUND = 'orders:refund',

  // Store Branches & System Audit
  BRANCHES_READ = 'branches:read',
  BRANCHES_MANAGE = 'branches:manage',
  AUDIT_READ = 'audit:read',

  // Store Content & Marketing
  CATEGORIES_MANAGE = 'categories:manage',
  BANNERS_MANAGE = 'banners:manage',
}
