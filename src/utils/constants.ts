
export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
} as const

export type UserRolesEnumType = typeof UserRolesEnum[keyof typeof UserRolesEnum]
export const AvailableUserRoles = Object.values(UserRolesEnum);


export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const;

export type TaskStatusEnumType = typeof TaskStatusEnum[keyof typeof TaskStatusEnum]  // key ka type deta hai
export const AvailableTaskStatuses = Object.values(TaskStatusEnum);
