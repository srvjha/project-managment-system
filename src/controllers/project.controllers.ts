import mongoose from "mongoose";
import { Project } from "../models/project.models";
import { asyncHandler } from "../utils/asynHandler";
import { handleZodError } from "../utils/handleZodError";
import {
  validateAddProjectMemberData,
  validateCreateProjectData,
  validateUpdateMemberData,
  validateUpdateProjectData,
} from "../validators/project.validation";
import { ApiResponse } from "../utils/ApiResponse";
import { ProjectMember } from "../models/projectmember.models";
import { UserRolesEnum } from "../utils/constants";
import { ApiError } from "../utils/ApiError";
import { User, UserInterface } from "../models/user.models";
import { validObjectId } from "../utils/helper";
import logger from "../utils/logger";

const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const projects = await ProjectMember.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(userId as string) },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projectData",
      },
    },
    {
      $unwind: "$projectData",
    },
    {
      $lookup: {
        from: "users",
        localField: "projectData.createdBy",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $unwind: "$userData",
    },
    {
      $lookup: {
        from: "projectmembers",
        localField: "project",
        foreignField: "project",
        as: "members",
      },
    },
    {
      $project: {
        _id: 0,
        pid: "$projectData._id",
        name: "$projectData.name",
        description: "$projectData.description",
        createdBy: {
          username: "$userData.username",
          email: "$userData.email",
        },
        role: 1,
        totalMembers: { $size: "$members" },
      },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projects,
        projects.length
          ? "Projects fetched successfully"
          : "No projects available",
      ),
    );
});

const getProjectById = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const project = await Project.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(pid) },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $lookup: {
        from: "projectmembers",
        localField: "_id",
        foreignField: "project",
        as: "membersData",
      },
    },

    {
      $unwind: {
        path: "$membersData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "membersData.user",
        foreignField: "_id",
        as: "membersData.userData",
      },
    },
    {
      $unwind: {
        path: "$membersData.userData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        updatedAt: { $first: "$updatedAt" },
        createdBy: { $first: "$createdBy" },
        members: {
          $push: {
            role: "$membersData.role",
            fullName: "$membersData.userData.fullName",
            username: "$membersData.userData.username",
            email: "$membersData.userData.email",
            avatar: "$membersData.userData.avatar.url",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        description: 1,
        updatedAt: 1,
        createdBy: {
          fullName: "$createdBy.fullName",
          username: "$createdBy.username",
          email: "$createdBy.email",
          avatar: "$createdBy.avatar.url",
        },
        members: 1,
      },
    },
  ]);

  if (!project) {
    throw new ApiError("Project not found", 400);
  }

  res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = handleZodError(
    validateCreateProjectData(req.body),
  );
  const createdBy = req.user._id;

  // here want to use transaction
  const clientSession = await mongoose.startSession();
  clientSession.startTransaction();
  let createdProject;
  try {
    createdProject = await Project.create(
      [
        {
          name,
          description,
          createdBy,
        },
      ],

      { session: clientSession },
    );

    // after creating also have to add me as a admin in project member
    await ProjectMember.create(
      [
        {
          user: createdProject[0].createdBy,
          project: createdProject[0]._id,
          role: UserRolesEnum.ADMIN,
        },
      ],
      { session: clientSession },
    );
    await clientSession.commitTransaction();
  } catch (error: any) {
    await clientSession.abortTransaction();
    logger.error(`Error occurred while creating project: ${error}`);
    if (error.code === 11000) {
      throw new ApiError("Project name must be unique per user", 400);
    }
    throw new ApiError(`Error while creating user ${error.message}`, 500);
  } finally {
    await clientSession.endSession();
  }
  res
    .status(200)
    .json(new ApiResponse(200, createdProject, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = handleZodError(
    validateUpdateProjectData(req.body),
  );
  const updatePayload: Partial<{ name: string; description: string }> = {};
  if (name !== undefined) {
    updatePayload.name = name;
  }
  if (description !== "") {
    updatePayload.description = description;
  }
  const { pid } = req.params;
  const updatedProject = await Project.findByIdAndUpdate(
    {
      _id: pid,
    },
    updatePayload,
    {
      new: true,
    },
  );

  if (!updatedProject) {
    throw new ApiError("Failed to update the project", 400);
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedProject, "Project updated successfully."),
    );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const clientSession = await mongoose.startSession();
  clientSession.startTransaction();
  try {
    await Project.findByIdAndDelete(pid, {
      session: clientSession,
    });
    await ProjectMember.deleteMany(
      { project: pid },
      {
        session: clientSession,
      },
    );
    await clientSession.commitTransaction();
  } catch (error: any) {
    await clientSession.abortTransaction();
    logger.error(`Error while deleting project: ${error}`);
    throw new ApiError(`Error while deleting project: ${error.message}`, 500);
  } finally {
    await clientSession.endSession();
  }
  res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully."));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const projectMembers = await ProjectMember.find({
    project: pid,
  })
    .populate({ path: "user", select: "username email fullName avatar -_id" })
    .select("role updatedAt");

  const formattedResults = projectMembers.map((member) => {
    const user = member.user as unknown as UserInterface;
    return {
      _id: member._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      role: member.role,
    };
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedResults,
        "Project members fetched successfully",
      ),
    );
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const { email, role } = handleZodError(
    validateAddProjectMemberData(req.body),
  );
  const { pid } = req.params;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const userId = user._id;
  // checking if the member is already added or not
  const existingMember = await ProjectMember.findOne({
    user: userId,
    project: pid,
  });
  if (existingMember) {
    throw new ApiError("Member already added to the project", 500);
  }

  const newMember = await ProjectMember.create({
    user: userId,
    project: pid,
    role,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, newMember, "Member added to project successfully"),
    );
});

const deleteMember = asyncHandler(async (req, res) => {
  const { mid } = req.params;
  validObjectId(mid, "Member");

  const deleteMember = await ProjectMember.findByIdAndDelete(mid);
  if (!deleteMember) {
    throw new ApiError("Member not found", 404);
  }
  res
    .status(200)
    .json(new ApiResponse(200, null, "Member deleted successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = handleZodError(validateUpdateMemberData(req.body));
  const { mid } = req.params;
  validObjectId(mid,"Member")
  const memberExist = await ProjectMember.findById(mid);

  if (!memberExist) {
    throw new ApiError("Member not found", 400);
  }

  if (memberExist.role === role) {
    throw new ApiError(`User already has the role: ${role}`, 400);
  }

  const projectMember = await ProjectMember.findByIdAndUpdate(
    mid,
    { role },
    {
      new: true,
    },
  );
  if (!projectMember) {
    throw new ApiError("Failed to update", 400);
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, projectMember, "Member role updated successfully"),
    );
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
