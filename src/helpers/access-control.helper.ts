import { TUserPermission } from "@models/role.model";
import { MESSAGE_TYPE } from "@validators/i18n/type";


// CONSTANTS
export const USER_PERMISSIONS = [
  "user.get_detail",
  "user.get_list",
  "user.update",
  "user.create",
  "user.update_by_id",
  "user.delete_by_id"
] as const;

export const ROLE_PERMISSIONS = [
  "role.create",
  "role.update",
  "role.get_list",
  "role.get_detail",
  "role.delete",
] as const



export const ALL_PERMISSIONS = [
  ...USER_PERMISSIONS,
  ...ROLE_PERMISSIONS,
];
 
export const PERMISSIONS_OF_USER: TUserPermission[] = [
  "user.get_detail",
  "user.update"
]

export const PERMISSIONS_NOT_ASSIGN: TUserPermission[] = [
  "role.create",
  "role.update",
  "role.delete",
  "user.create",
  "user.update_by_id",
  "user.delete_by_id"
]


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