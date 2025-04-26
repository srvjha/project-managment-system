import { SafeParseReturnType } from "zod";
import { ApiError } from "./ApiError";



const handleZodError = (result: SafeParseReturnType<any, any>) => {
  if (!result.success) {
    const missing = result.error.issues.find(
      (issue) => issue.code === "invalid_type" && issue.received === "undefined"
    );

    if (missing) {
      throw new ApiError(
      
         `Missing required field: [${result.error.issues[0].path.join('.').toUpperCase()}]`,
        500
      );
    }

    throw new ApiError(
     
      result.error.issues[0].message,
      500
    );
  }

  return result.data;
};

export { handleZodError };