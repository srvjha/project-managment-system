import mongoose from "mongoose";
import { ProjectNote } from "../models/note.models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynHandler";
import { handleZodError } from "../utils/handleZodError";
import { validateNoteData } from "../validators/notes.validation";
import { UserInterface } from "../models/user.models";

const getNotes = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const notes = await ProjectNote.aggregate([
    {
      $match:{project:new mongoose.Types.ObjectId(projectId)}
    },
    {
      $lookup:{
        from:"projects",
        localField:"project",
        foreignField:"_id",
        as:"projectData"
      }
    },
    {
      $unwind:"$projectData"
    },
    {
      $lookup:{
        from:"users",
        localField:"createdBy",
        foreignField:"_id",
        as:"createdBy"
      }
    },
    {
      $unwind:"$createdBy"
    },
    {
      $project:{
        _id:1,
        username:"$createdBy.username",
        email:"$createdBy.email",
        fullName:"$createdBy.fullName",
        avatar:"$createdBy.avatar.url",
        content:1,
        updatedAt:1
      }
    }
  ])

  res.status(200).json(
    new ApiResponse(
      200,
      notes,
      "Notes fetched successfully"
    )
  )
});

const getNoteById = asyncHandler(async (req, res) => {
  const noteId = req.params.noteid;

  const note = await ProjectNote.findById(noteId).populate({
    path: "createdBy",
    select: "username email fullName avatar -_id"
  });

  if (!note) {
    throw new ApiError("Note not found", 400);
  }

  const createdBy = note.createdBy as unknown as UserInterface;

  const formattedResult = {
    _id: note._id,
    username: createdBy.username,
    email: createdBy.email,
    fullName: createdBy.fullName,
    avatar: createdBy.avatar,
    content: note.content
  };

  res.status(200).json(
    new ApiResponse(200, formattedResult, "Note Fetched Successfully")
  );
});


const createNote = asyncHandler(async (req, res) => {
  const { content } = handleZodError(validateNoteData(req.body));
  const projectId = req.params.id;
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
  const projectId = req.params.id;
  const userId = req.user._id;

  const note = await ProjectNote.findOneAndUpdate(
    {
      project: projectId,
      createdBy: userId,
    },
    { content },
    { new: true },
  );

  if (!note) {
    throw new ApiError("Error while updating note", 500);
  }

  res
    .status(200)
    .json(new ApiResponse(200, note, "Notes Updated Successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user._id; 

 const deletedNote =  await ProjectNote.findOneAndDelete({
    project: projectId,
    createdBy: userId,
  });
  if (!deletedNote) {
    throw new ApiError("Note not found or already deleted", 404);
  }

  res.status(200).json(new ApiResponse(200, {}, "Notes Deleted Successfully"));
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
