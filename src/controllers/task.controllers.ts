import mongoose from "mongoose";
import { ProjectMember } from "../models/projectmember.models";
import { Attachment, Task } from "../models/task.models";
import { User } from "../models/user.models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { handleZodError } from "../utils/handleZodError";
import {
  validateSubTaskData,
  validateTaskData,
  validateUpdateSubTaskData,
  validateUpdateTaskData,
} from "../validators/task.validation";
import { SubTask } from "../models/subtask.models";
import { env } from "../validators/env";
import { validObjectId } from "../utils/helper";
import logger from "../utils/logger";
import fs from "fs";

const getTasks = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const task = await Task.aggregate([
    {
      $match: { project: new mongoose.Types.ObjectId(pid) },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        as: "AssignedByData",
      },
    },
    {
      $unwind: "$AssignedByData",
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "AssignedToData",
      },
    },
    {
      $unwind: "$AssignedToData",
    },
    {
      $project: {
        title: 1,
        description: 1,
        status: 1,
        attachments: 1,
        updatedAt: 1,
        assignedTo: {
          username: "$AssignedToData.username",
          avatar: "$AssignedToData.avatar.url",
        },
        assignedBy: {
          username: "$AssignedByData.username",
          avatar: "$AssignedByData.avatar.url",
        },
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        task,
        task.length ? "Task fetched Successfully" : "No Task Available",
      ),
    );
});

const getTaskById = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  validObjectId(tid, "Task");

  const existingTask = await Task.findById(tid);
  if (!existingTask) {
    throw new ApiError("Task not found", 404);
  }

  const task = await Task.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(tid) },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        as: "AssignedByData",
      },
    },
    {
      $unwind: "$AssignedByData",
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "AssignedToData",
      },
    },
    {
      $unwind: "$AssignedToData",
    },
    {
      $project: {
        title: 1,
        description: 1,
        status: 1,
        attachments: 1,
        updatedAt: 1,
        assignedTo: {
          username: "$AssignedToData.username",
          fullName: "$AssignedToData.fullName",
          avatar: "$AssignedToData.avatar.url",
        },
        assignedBy: {
          username: "$AssignedByData.username",
          fullName: "$AssignedByData.fullName",
          avatar: "$AssignedByData.avatar.url",
        },
      },
    },
  ]);

  if (!task) {
    throw new ApiError("Task not found", 400);
  }

  res.status(200).json(new ApiResponse(200, task, "Task fetched Successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, email } = handleZodError(
    validateTaskData(req.body),
  );
  const { pid } = req.params;
  const userId = req.user._id;

  const assignedToUser = await User.findOne({ email });
  if (!assignedToUser) {
    throw new ApiError("Assigned User not found", 400);
  }
  const isProjectMember = await ProjectMember.findOne({
    user: assignedToUser._id,
    project: pid,
  });

  if (!isProjectMember) {
    throw new ApiError("Assigned User not a member of this project", 400);
  }

  const task = await Task.create({
    title,
    description,
    project: pid,
    assignedTo: assignedToUser._id,
    assignedBy: userId,
  });

  if (!task) {
    throw new ApiError("Error while creating task", 500);
  }

  const attachments = await Promise.all(
    (req.files as Express.Multer.File[]).map(async (file) => {
      const result = await uploadOnCloudinary(file.path);
      return {
        url: result?.secure_url,
        mimetype: file.mimetype,
        size: file.size,
      };
    }),
  );
  task.attachments = attachments as Attachment[];
  await task.save();

  res.status(200).json(new ApiResponse(200, task, "Task Created Successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, email, status } = handleZodError(
    validateUpdateTaskData(req.body),
  );
  const { pid, tid } = req.params;
  validObjectId(tid, "Task");

  const updatePayload: Partial<{
    title: string;
    description: string;
    assignedTo: string;
    status: string;
  }> = {};

  if (title !== undefined) updatePayload.title = title;
  if (description !== "") updatePayload.description = description;
  if (email !== undefined) {
    const assignedToUser = await User.findOne({ email });
    if (!assignedToUser) {
      throw new ApiError("Assigned User not found", 400);
    }
    const isProjectMember = await ProjectMember.findOne({
      user: assignedToUser._id,
      project: pid,
    });

    if (!isProjectMember) {
      throw new ApiError("Assigned User not a member of this project", 400);
    }

    updatePayload.assignedTo = assignedToUser._id as string;
  }

  if (status !== undefined) updatePayload.status = status;

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError("At least one field is required to update", 400);
  }

  const updateTask = await Task.findByIdAndUpdate(tid, updatePayload, {
    new: true,
  });

  if (!updateTask) {
    throw new ApiError("Task does not exist", 400);
  }

  res
    .status(200)
    .json(new ApiResponse(200, updateTask, "Task Updated Successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  validObjectId(tid, "Task");

  const existingTask = await Task.findById(tid);
  if (!existingTask) {
    throw new ApiError("Task not found", 404);
  }

  const clientSession = await mongoose.startSession();
  clientSession.startTransaction();

  try {
    await Task.findByIdAndDelete(tid);
    await SubTask.deleteMany({ task: tid });

    clientSession.commitTransaction();
  } catch (error: any) {
    clientSession.abortTransaction();
    logger.error(`Error while deleting the task:${error}`);
    throw new ApiError(`Error while deleting the task:${error.message}`, 400);
  } finally {
    clientSession.endSession();
  }

  res.status(200).json(new ApiResponse(200, null, "Task Deleted Successfully"));
});

const addAttachments = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  const attachments = req.files as Express.Multer.File[];

  validObjectId(tid, "Task");

  const task = await Task.findById(tid);
  if (!task) {
    throw new ApiError("Task not found", 400);
  }

  if (!attachments || attachments.length === 0) {
    throw new ApiError("Please add attachments", 400);
  }

  const existingAttachments = task.attachments?.length || 0;
  const newAttachments = attachments.length;

  if (existingAttachments + newAttachments > env.MAX_ATTACHMENTS) {
    attachments.forEach((file) => fs.unlinkSync(file.path));
    throw new ApiError(
      `Attachment limit exceeded. You can upload only ${env.MAX_ATTACHMENTS - existingAttachments} more.`,
      400,
    );
  }

  const addAttachmentsOnly = await Promise.all(
    attachments.map(async (file) => {
      const result = await uploadOnCloudinary(file.path);
      return {
        url: result?.secure_url,
        mimetype: file.mimetype,
        size: file.size,
      };
    }),
  );

  task.attachments.push(...(addAttachmentsOnly as Attachment[]));

  await task.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, task.attachments, "Attachments added successfully"),
    );
});
const deleteAttachments = asyncHandler(async (req, res) => {
  const { aid } = req.params;

  validObjectId(aid, "Attachment");

  const result = await Task.updateOne(
    { "attachments._id": aid },
    { $pull: { attachments: { _id: aid } } },
  );

  if (result.modifiedCount === 0) {
    throw new ApiError("Attachment not found", 400);
  }
  res
    .status(200)
    .json(new ApiResponse(200, null, "Attachment Deleted Successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title } = handleZodError(validateSubTaskData(req.body));
  const { tid, pid } = req.params;
  const userId = req.user._id;

  validObjectId(tid, "Task");

  const existingTask = await Task.findById(tid);

  if (!existingTask) {
    throw new ApiError("Task not found", 400);
  }

  const subtask = await SubTask.create({
    title,
    task: tid,
    project: pid,
    createdBy: userId,
  });

  if (!subtask) {
    throw new ApiError("Error while creating subtask", 400);
  }

  res
    .status(200)
    .json(new ApiResponse(200, subtask, "SubTask Created Successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = handleZodError(
    validateUpdateSubTaskData(req.body),
  );
  const { sid } = req.params;

  validObjectId(sid, "SubTask");

  const updatePayload: Partial<{
    title: string;
    isCompleted: boolean;
  }> = {};

  if (title !== undefined) updatePayload.title = title;
  if (isCompleted !== undefined) updatePayload.isCompleted = isCompleted;

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError("At least one field is required to update", 400);
  }

  const updateSubTask = await SubTask.findByIdAndUpdate(sid, updatePayload, {
    new: true,
  }).select("title isCompleted updatedAt");

  if (!updateSubTask) {
    throw new ApiError("Failed to update the subtask", 500);
  }

  res
    .status(200)
    .json(new ApiResponse(200, updateSubTask, "SubTask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { sid } = req.params;
  validObjectId(sid, "SubTask");

  const deletedSubTask = await SubTask.findByIdAndDelete(sid);

  if (!deletedSubTask) {
    throw new ApiError("Subtask not found", 400);
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Subtask deleted successfully"));
});

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
  addAttachments,
  deleteAttachments,
};
