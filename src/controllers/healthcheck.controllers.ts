import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynHandler";

const healthCheck = asyncHandler(async(req, res) => {
  console.log("logic to connect with db");
  
  res.status(200).json(new ApiResponse(200, {}, "Server is running" ));
});

export { healthCheck };
