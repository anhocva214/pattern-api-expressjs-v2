export const ME_PERMISSIONS = [
    "me.get_info",
    "me.update_info",
] as const

export const USER_PERMISSIONS = [
    "user.get_detail",
    "user.get_list",
    "user.create",
    "user.update",
    "user.delete",
] as const

export const ALL_PERMISSIONS = [
    ...ME_PERMISSIONS,
    ...USER_PERMISSIONS
]