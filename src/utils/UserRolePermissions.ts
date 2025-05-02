import {
  UserRolesEnumType,
  ActionsEnumType,
  RolePermissions,
} from "../utils/constants";
import { ApiError } from "./ApiError";

export const canUserPerformAction = (
  role: UserRolesEnumType,
  action: ActionsEnumType,
): boolean => {
  const allowedActions = RolePermissions[role] || [];
  return allowedActions.includes(action);
};

export const UserCanPerformAction = (
  role: UserRolesEnumType,
  action: ActionsEnumType,
) => {
  if (!canUserPerformAction(role, action)) {
    throw new ApiError(`Unauthorized: ${role} cannot perform ${action}`, 500);
  }
};
