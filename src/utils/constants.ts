export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
} as const;

export type UserRolesEnumType =
  (typeof UserRolesEnum)[keyof typeof UserRolesEnum];
export const AvailableUserRoles = Object.values(UserRolesEnum);

export const ActionsEnum = {
  CREATE_PROJECT: "create_project",
  DELETE_PROJECT: "delete_project",
  UPDATE_PROJECT: "update_project",
  ADD_MEMBERS: "add_members",
  REMOVE_MEMBERS: "remove_members",
  ADD_TASK: "add_task",
  DELETE_TASK: "delete_task",
  UPDATE_TASK: "update_task",
  ADD_SUBTASK: "add_subtask",
  DELETE_SUBTASK: "delete_subtask",
  UPDATE_SUBTASK: "update_subtask",
  ADD_NOTES: "add_notes",
  DELETE_NOTES: "delete_notes",
  UPDATE_NOTES: "update_notes",
  VIEW_PROJECT: "view_project",
  VIEW_NOTES: "view_notes",
  VIEW_TASKS: "view_tasks",
  READ_PROJECT: "read_project",
  UPDATE_ROLE: "update_role",
  ADD_ATTACHMENTS: "add_attachements",
  DELETE_ATTACHMENTS: "delete_attachements",
} as const;

export type ActionsEnumType = (typeof ActionsEnum)[keyof typeof ActionsEnum];

export const RolePermissions: Record<UserRolesEnumType, ActionsEnumType[]> = {
  admin: [
    ActionsEnum.DELETE_PROJECT,
    ActionsEnum.UPDATE_PROJECT,
    ActionsEnum.ADD_MEMBERS,
    ActionsEnum.REMOVE_MEMBERS,
    ActionsEnum.ADD_TASK,
    ActionsEnum.DELETE_TASK,
    ActionsEnum.UPDATE_TASK,
    ActionsEnum.ADD_SUBTASK,
    ActionsEnum.DELETE_SUBTASK,
    ActionsEnum.UPDATE_SUBTASK,
    ActionsEnum.ADD_NOTES,
    ActionsEnum.DELETE_NOTES,
    ActionsEnum.UPDATE_NOTES,
    ActionsEnum.VIEW_PROJECT,
    ActionsEnum.READ_PROJECT,
    ActionsEnum.UPDATE_ROLE,
    ActionsEnum.VIEW_NOTES,
    ActionsEnum.VIEW_TASKS,
    ActionsEnum.ADD_ATTACHMENTS,
    ActionsEnum.DELETE_ATTACHMENTS,
  ],
  project_admin: [
    ActionsEnum.ADD_TASK,
    ActionsEnum.DELETE_TASK,
    ActionsEnum.UPDATE_TASK,
    ActionsEnum.ADD_SUBTASK,
    ActionsEnum.DELETE_SUBTASK,
    ActionsEnum.UPDATE_SUBTASK,
    ActionsEnum.ADD_NOTES,
    ActionsEnum.DELETE_NOTES,
    ActionsEnum.UPDATE_NOTES,
    ActionsEnum.VIEW_PROJECT,
    ActionsEnum.READ_PROJECT,
    ActionsEnum.VIEW_NOTES,
    ActionsEnum.VIEW_TASKS,
    ActionsEnum.ADD_ATTACHMENTS,
    ActionsEnum.DELETE_ATTACHMENTS,
  ],
  member: [
    ActionsEnum.ADD_SUBTASK,
    ActionsEnum.DELETE_SUBTASK,
    ActionsEnum.UPDATE_SUBTASK,
    ActionsEnum.ADD_NOTES,
    ActionsEnum.DELETE_NOTES,
    ActionsEnum.UPDATE_NOTES,
    ActionsEnum.VIEW_PROJECT,
    ActionsEnum.READ_PROJECT,
    ActionsEnum.VIEW_NOTES,
    ActionsEnum.VIEW_TASKS,
    ActionsEnum.ADD_ATTACHMENTS,
    ActionsEnum.DELETE_ATTACHMENTS,
  ],
};

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const;

export type TaskStatusEnumType =
  (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum]; // key ka type deta hai
export const AvailableTaskStatuses = Object.values(TaskStatusEnum);

export const allowedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
  // docx - word doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // xlsx -  excel sheet
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
