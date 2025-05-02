import mongoose from "mongoose";
import { ApiError } from "./ApiError";


export const validObjectId = (id: string, entityName: string): void | never => {
  if (!mongoose.Types.ObjectId.isValid(id?.trim?.())) {
    throw new ApiError(`Invalid ${entityName} ID`, 400);
  }
}
