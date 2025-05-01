import mongoose from "mongoose";
import { ProjectNote } from "../models/note.models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynHandler";
import { handleZodError } from "../utils/handleZodError";
import { validateNoteData } from "../validators/notes.validation";
import { UserInterface } from "../models/user.models";

const getNotes = asyncHandler(async (req, res) => {
  const {projectId} = req.params;
  const notes = await ProjectNote.aggregate([
    {
      $match: { project: new mongoose.Types.ObjectId(projectId) },
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
      $project: {
        _id: 1,
        content: 1,
        updatedAt: 1,
        createdBy: {
          username: "$createdBy.username",
          email: "$createdBy.email",
          fullName: "$createdBy.fullName",
          avatar: "$createdBy.avatar.url",
        },
      },
    },
  ]);
 
  res
    .status(200)
    .json(new ApiResponse(
      200,
      notes.length
      ? "Notes fetched successfully"
      : "No notes available",
        "Notes fetched successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
  const noteId = req.params.noteid;

  const note = await ProjectNote.findById(noteId).populate({
    path: "createdBy",
    select: "username email fullName avatar -_id",
  });

  if (!note) {
    throw new ApiError("Note not found", 400);
  }

  const createdBy = note.createdBy as unknown as UserInterface;

  const formattedResult = {
    _id: note._id,
    content: note.content,
    createdBy:{
      username: createdBy.username,
      email: createdBy.email,
      fullName: createdBy.fullName,
      avatar: createdBy.avatar,
    }
  };

  res
    .status(200)
    .json(new ApiResponse(200, formattedResult, "Note Fetched Successfully"));
});

const createNote = asyncHandler(async (req, res) => {
  const { content } = handleZodError(validateNoteData(req.body));
  const {projectId} = req.params;
  const userId = req.user._id;

  const note = await ProjectNote.create({
    project: projectId,
    createdBy: userId,
    content,
  });
  if (!note) {
    throw new ApiError("Error while creating note", 500);
  }

  res
    .status(200)
    .json(new ApiResponse(200, note, "Notes Created Successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { content } = handleZodError(validateNoteData(req.body));
  const noteId = req.params.noteid;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError("Invalid note ID", 400);
  }

  const note = await ProjectNote.findByIdAndUpdate(
    noteId,
    {content},
    { new: true },
  ).select("content createdAt updatedAt");

  if (!note) {
    throw new ApiError("note not found or update failed", 500);
  }

  res.status(200).json(new ApiResponse(200, note, "Note Updated Successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const noteId = req.params.noteid;
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError("Invalid note ID", 400);
  }

 const deletedNote =  await ProjectNote.findByIdAndDelete(noteId);
 if(!deletedNote){
  throw new ApiError("Note not exist",400)
 }

  res.status(200).json(new ApiResponse(200, null, "Note Deleted Successfully"));
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
