import { ProjectMember } from "../models/projectmember.models";
import { ApiError } from "../utils/ApiError";
import { canUserPerformAction } from "../utils/UserRolePermissions";
import { NextFunction, Request, Response } from "express";
import { ActionsEnumType } from "../utils/constants";
import { asyncHandler } from "../utils/asynHandler";
import { validObjectId } from "../utils/helper";
import logger from "../utils/logger";

export const checkPermission = (action: ActionsEnumType) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const { pid } = req.params;

      validObjectId(pid, "Project");
      const userMember = await ProjectMember.findOne({
        user: user._id,
        project: pid,
      });
      if (!userMember) {
        throw new ApiError("Access Denied", 400);
      }
      try {
        const allowedActions = canUserPerformAction(userMember.role, action);
        if (!allowedActions) {
          throw new ApiError("Access Denied", 403);
        }
        next();
      } catch (error) {
        logger.error("Error checking permission:", error);
        throw new ApiError("Error while checking permission", 500);
      }
    },
  );
};
