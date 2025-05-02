import mongoose, { Document, Schema } from "mongoose";

interface ProjectInterface extends Document {
  name: string;
  description: string;
  createdBy: Schema.Types.ObjectId;
}

const projectSchema = new Schema<ProjectInterface>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
// unique project name per user
projectSchema.index({ name: 1, createdBy: 1 }, { unique: true });
export const Project = mongoose.model("Project", projectSchema);
