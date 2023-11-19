import { MESSAGE_TYPE } from "@validators/i18n/type";


// CONSTANTS
export const USER_PERMISSIONS = [
  "user.get_detail",
  "user.get_list",
  "user.create",
  "user.update",
  "user.delete",
] as const;

export const SUPER_ADMIN_PERMISSIONS = [
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
  ...SUPER_ADMIN_PERMISSIONS,
];


// FUNCTIONS
export function isArrayOfString(value: any) {
  if (!Array.isArray(value)) {
    throw new Error(MESSAGE_TYPE.invalid);
  }

  for (const item of value) {
    if (typeof item !== "string") {
      throw new Error(MESSAGE_TYPE.invalid);
    }
  }

  return true;
}