export const ME_PERMISSIONS = [
    "me.get_info",
    "me.update_info",
    "me.request_dating",
    "me.approve_dating",
    "me.get_notifications",
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