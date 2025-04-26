import mongoose, { Document, Schema } from "mongoose";

interface ProjectNoteSchema extends Document {
  project:Schema.Types.ObjectId,
  createdBy:Schema.Types.ObjectId,
  content:string
}
const projectNoteSchema = new Schema<ProjectNoteSchema>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema);
