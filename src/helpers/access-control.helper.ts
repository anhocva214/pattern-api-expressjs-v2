export const USER_PERMISSIONS = [
  "user.get_detail",
  "user.get_list",
  "user.create",
  "user.update",
  "user.delete",
] as const;

export const ADMIN_PERMISSIONS = [
  "admin.get_detail",
  "admin.get_list",
] as const;

export const SUPER_ADMIN_PERMISSIONS = [
  "admin.create",
  "admin.update",
  "admin.delete",
  "role.create",
  "role.update",
  "role.get_list",
  "role.get_detail",
  "role.delete",
  "permission.create",
  "permission.update",
  "permission.get_list",
  "permission.get_detail",
  "permission.delete",
] as const;

export const ALL_PERMISSIONS = [
  ...USER_PERMISSIONS,
  ...ADMIN_PERMISSIONS,
  ...SUPER_ADMIN_PERMISSIONS,
];
