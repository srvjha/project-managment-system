import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { env } from "../validators/env";
import { ApiError } from "./ApiError";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudnary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploded successfully
    console.log("File is Uploaded Succesfully on CLoudnary!!!", response.url);
    // fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    throw new ApiError("Failed to upload on cloudinary",500)
  }
};

export { uploadOnCloudinary };
