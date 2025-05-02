import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError";
import { allowedMimeTypes } from "../utils/constants";

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extention = path.extname(file.originalname);
    // saurav-1498713987.png
    cb(null, `${file.fieldname}-${uniqueSuffix}${extention}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1000 * 1000,
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError("Unsupported file type", 500));
  }
};

export const uploadTaskAttachments = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10000 * 1024 * 1024 },
}).array("attachments", 5);
