import mongoose from "mongoose";
import { Project } from "../models/project.models";
import { asyncHandler } from "../utils/asynHandler";
import { handleZodError } from "../utils/handleZodError";
import {
  validateAddProjectMemberData,
  validateCreateProjectData,
  validateRemoveProjectMemberData,
  validateUpdateProjectData,
} from "../validators/project.validation";
import { ApiResponse } from "../utils/ApiResponse";
import { ProjectMember } from "../models/projectmember.models";
import { UserRolesEnum } from "../utils/constants";
import { ApiError } from "../utils/ApiError";
import { User, UserInterface } from "../models/user.models";

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
        projectId: "$projectData._id",
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
  res.status(200).json(
    new ApiResponse(
      200,
      projects.length
        ? "Projects fetched successfully"
        : "No projects available",
      "Projects fetched successfully",
    ),
  );
});

const getProjectById = asyncHandler(async (req, res) => {
  const {projectId} = req.params;
  // const project = await Project.findById(projectId)
  //   .populate({ path: "createdBy", select: "username email -_id" })
  //   .select("name description createdBy updatedAt");

  const project = await Project.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(projectId) },
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

  res.status(200).json(
    new ApiResponse(
      200,

      project,

      "Project fetched successfully",
    ),
  );
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = handleZodError(
    validateCreateProjectData(req.body),
  );
  console.log("description ", description);
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
  } catch (error:any) {
    await clientSession.abortTransaction();
    if(error.code === 11000){
      throw new ApiError("Project name must be unique per user",400)
    }
    throw new ApiError(`Error while creating user ${error.message}`, 500);
  } finally {
    await clientSession.endSession();
  }
  res.status(200).json(
    new ApiResponse(
      200,
      {
        project: createdProject,
      },
      "Project created successfully",
    ),
  );
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
  console.log("updatePayload: ", updatePayload);
  const {projectId} = req.params;
  await Project.findByIdAndUpdate(
    {
      _id: projectId,
    },
    updatePayload,
    {
      new: true,
    },
  );
  res
    .status(200)
    .json(new ApiResponse(200, null, "Project updated successfully."));
});

const deleteProject = asyncHandler(async (req, res) => {
  const {projectId} = req.params;
  const clientSession = await mongoose.startSession();
  clientSession.startTransaction();
  try {
    await Project.findByIdAndDelete(projectId, {
      session: clientSession,
    });
    await ProjectMember.deleteMany(
      { project: projectId },
      {
        session: clientSession,
      },
    );
    await clientSession.commitTransaction();
  } catch (error) {
    await clientSession.abortTransaction();
    console.log("error: ", error);
    throw new ApiError("Error deleting project", 500);
  } finally {
    await clientSession.endSession();
  }
  res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully."));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const {projectId} = req.params;
  const projectMembers = await ProjectMember.find({
    project: projectId,
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
  const {projectId} = req.params;

  const user = await User.findOne({ email });
  console.log("user: ", user);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const userId = user._id;
  // checking if the member is already added or not
  const existingMember = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });
  if (existingMember) {
    throw new ApiError("Member already added to the project", 500);
  }

  const newMember = await ProjectMember.create({
    user: userId,
    project: projectId,
    role,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        member: newMember,
      },
      "Member added to project successfully",
    ),
  );
});

const deleteMember = asyncHandler(async (req, res) => {
  const { email } = handleZodError(validateRemoveProjectMemberData(req.body));
  const {projectId} = req.params;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not member of this project", 400);
  }
  const deleteMember = await ProjectMember.findOneAndDelete({
    user: user._id,
    project: projectId,
  });
  if (!deleteMember) {
    throw new ApiError("Member not found", 404);
  }
  res.status(200).json(new ApiResponse(200, {}, "Member deleted successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { email, role } = handleZodError(
    validateAddProjectMemberData(req.body),
  );
  const {projectId} = req.params;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const projectMember = await ProjectMember.findOne({
    user: user._id,
    project: projectId,
  });

  if (!projectMember) {
    throw new ApiError("User is not a member of this project", 400);
  }

  if (projectMember.role === role) {
    throw new ApiError(`User already has the role: ${role}`, 400);
  }

  projectMember.role = role;
  await projectMember.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { member: projectMember },
        "Member role updated successfully",
      ),
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
