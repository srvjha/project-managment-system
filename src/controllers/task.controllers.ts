import mongoose, { BooleanExpression } from "mongoose";
import { ProjectMember } from "../models/projectmember.models";
import { Attachment, Task, TaskInterface } from "../models/task.models";
import { User } from "../models/user.models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { handleZodError } from "../utils/handleZodError";
import { validateSubTaskData, validateTaskData, validateUpdateSubTaskData, validateUpdateTaskData } from "../validators/task.validation";
import { SubTask } from "../models/subtask.models";

const getTasks = asyncHandler(async (req, res) => {});

// get task by id
const getTaskById = asyncHandler(async (req, res) => {
  // get task by id
});

//create task

const createTask = asyncHandler(async (req, res) => {
  // create task

  const { title, description, email } = handleZodError(
    validateTaskData(req.body),
  );
  const {projectId} = req.params;
  const userId = req.user._id;

  const existingTask = await Task.findOne({ title,project:projectId });
  if (existingTask) {
    throw new ApiError("Task already Exists", 400);
  }

  const assignedToUser = await User.findOne({ email });
  if (!assignedToUser) {
    throw new ApiError("Assigned User not found", 400);
  }
  const isProjectMember = await ProjectMember.findOne({
    user: assignedToUser._id,
    project: projectId,
  });

  if (!isProjectMember) {
    throw new ApiError("Assigned User not a member of this project", 400);
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
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

// update task
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, email, status } = handleZodError(
    validateUpdateTaskData(req.body),
  );
  console.log("status: ",status)
  const {projectId,taskId} = req.params;
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError("Invalid task ID", 400);
  }

  const existingTask = await Task.findById(taskId);
  if (!existingTask) {
    throw new ApiError("Task not found", 404);
  }

  const assignedToUser = await User.findOne({ email });
  if (!assignedToUser) {
    throw new ApiError("Assigned User not found", 400);
  }
  const isProjectMember = await ProjectMember.findOne({
    user: assignedToUser._id,
    project: projectId,
  });

  if (!isProjectMember) {
    throw new ApiError("Assigned User not a member of this project", 400);
  }

  const updatePayload: Partial<{
    title: string;
    description: string;
    assignedTo: string;
    status: string;
  }> = {};

  if (title !== undefined) updatePayload.title = title;
  if (description !== "") updatePayload.description = description;
  if (email !== undefined)
    updatePayload.assignedTo = assignedToUser._id as string;
  if (status !== undefined) updatePayload.status = status;

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError("At least one field is required to update", 400);
  }

  console.log("updated paylod: ",updatePayload)

  const updateTask = await Task.findByIdAndUpdate(taskId, updatePayload, {
    new: true,
  });

  if (!updateTask) {
    throw new ApiError("Failed to update", 400);
  }

  res
    .status(200)
    .json(new ApiResponse(200, updateTask, "Task Updated Successfully"));
});

// delete task
const deleteTask = asyncHandler(async (req, res) => {
  
});

// create subtask
const createSubTask = asyncHandler(async (req, res) => {
  const {title} = handleZodError(validateSubTaskData(req.body))
  const {taskId,projectId} = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError("Invalid task ID", 400);
  }
  
  const existingTask = await Task.findById(taskId);

  if(!existingTask){
    throw new ApiError("Task not found",400)
  }
  const existingSubtask  = await SubTask.findOne({
    title,
    task:taskId,
    project:projectId
  })

  if(existingSubtask){
    throw new ApiError("SubTask with Same Title already exists",400)
  }

  const subtask = await SubTask.create({
    title,
    task:taskId,
    project:projectId,
    createdBy:userId
  })

  if(!subtask){
    throw new ApiError("Error while creating subtask",400)
  }

  res.status(200).json(
    new ApiResponse(
      200,
      subtask,
      "SubTask Created Successfully"
    )
  )

});

// update subtask
const updateSubTask = asyncHandler(async (req, res) => {
  const {title,isCompleted} = handleZodError(validateUpdateSubTaskData(req.body));
  const{subtaskId} = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(subtaskId)) {
    throw new ApiError("Invalid subtask ID", 400);
  }
  const existingSubtask = await SubTask.findById(subtaskId);

  if(!existingSubtask){
    throw new ApiError("SubTask not exists",400)
  }

  const updatePayload:Partial<{
    title:string,
    isCompleted:boolean
  }> = {}

  if(title !== undefined) updatePayload.title = title;
  if(isCompleted !== undefined) updatePayload.isCompleted = isCompleted

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError(
      "At least one field is required to update",
      400
    );
  }

  const updateSubTask = await SubTask.findByIdAndUpdate(
    subtaskId,
    updatePayload,
    {new:true}
  ).select("title isCompleted updatedAt")

  if(!updateSubTask){
    throw new ApiError("Failed to update the subtask",500)
  }

  res.status(200).json(
       new ApiResponse(
        200,
        updateSubTask,
        "SubTask updated successfully"
       )
  )
});

// delete subtask
const deleteSubTask = asyncHandler(async (req, res) => {
  // delete subtask
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
};
