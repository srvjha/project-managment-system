import { ProjectMember } from "../models/projectmember.models";
import { ApiError } from "../utils/ApiError";
import { canUserPerformAction, UserCanPerformAction } from "../utils/UserRolePermissions";
import { NextFunction, Request, Response } from "express";
import { ActionsEnumType } from "../utils/constants";
import { asyncHandler } from "../utils/asynHandler";
import mongoose from "mongoose";


export const checkPermission = (action: ActionsEnumType) => {
  return asyncHandler(async (req:Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const {projectId}= req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError("Invalid project ID",400);
    }
    // now will find the role of the user in the project member table

    const userMember = await ProjectMember.findOne({
      user: user._id,
      project: projectId,
    });
    console.log("userMember: ",userMember)
    if (!userMember) {
      throw new ApiError("Access Denied", 400);
    }
    try {
      const allowedActions = canUserPerformAction(userMember.role, action);
      console.log("allowedActions", allowedActions);
      if(!allowedActions) {
        throw new ApiError("Access Denied", 400);
      }
      next();
    } catch (error) {
        console.error("Error checking permission:", error);
        throw new ApiError("Error while checking permission", 500);
    }
  });
};
