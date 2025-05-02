import mongoose, { Document, Schema } from "mongoose";
import {
  AvailableUserRoles,
  UserRolesEnum,
  UserRolesEnumType,
} from "../utils/constants";

interface ProjectMemberInterface extends Document {
  user: Schema.Types.ObjectId;
  project: Schema.Types.ObjectId;
  role: UserRolesEnumType;
}
const projectMemberSchema = new Schema<ProjectMemberInterface>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true },
);

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
