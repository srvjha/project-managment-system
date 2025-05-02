import { Request, Response } from "express";

import { ApiResponse } from "../utils/ApiResponse";

const healthCheck = (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, {}, "Health check passed"));
};

export { healthCheck };
