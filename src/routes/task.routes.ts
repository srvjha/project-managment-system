import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { uploadTaskAttachments } from "../middlewares/multer.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { createTask, deleteTask, updateTask } from "../controllers/task.controllers";

const router = Router();

router.post(
  "/create-task/project/:id",
  verifyUser,
  checkPermission("add_task"),
  uploadTaskAttachments,
  createTask,
);

router.put(
    "/update-task/:taskid/project/:id",
  verifyUser,
  checkPermission("update_task"),
  uploadTaskAttachments,
  updateTask,
)

router.delete(
  "/delete-task/:taskid/project/:id",
  verifyUser,
  checkPermission("delete_task"),
  uploadTaskAttachments,
  deleteTask,

)
export default router;
