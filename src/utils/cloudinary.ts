import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { env } from "../validators/env";
import { ApiError } from "./ApiError";
import logger from "./logger";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    logger.info("File is Uploaded Succesfully on CLoudnary!!!", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    throw new ApiError("Failed to upload on cloudinary", 500);
  }
};

export { uploadOnCloudinary };
