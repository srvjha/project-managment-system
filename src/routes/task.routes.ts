import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { uploadTaskAttachments } from "../middlewares/multer.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import {
  addAttachments,
  createSubTask,
  createTask,
  deleteAttachments,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers";

const router = Router();

// task routes
router.post(
  "/:pid/task/create",
  verifyUser,
  checkPermission("add_task"),
  uploadTaskAttachments,
  createTask,
);

router.patch(
  "/:pid/task/:tid/update",
  verifyUser,
  checkPermission("update_task"),
  uploadTaskAttachments,
  updateTask,
);

router.delete(
  "/:pid/task/:tid/delete",
  verifyUser,
  checkPermission("delete_task"),
  deleteTask,
);

router.get("/:pid/tasks", verifyUser, checkPermission("view_tasks"), getTasks);

router.get(
  "/:pid/task/:tid",
  verifyUser,
  checkPermission("view_tasks"),
  getTaskById,
);

// subtask route

router.post(
  "/:pid/task/:tid/create/subtask",
  verifyUser,
  checkPermission("add_subtask"),
  createSubTask,
);

router.patch(
  "/:pid/subtask/:sid/update",
  verifyUser,
  checkPermission("update_subtask"),
  updateSubTask,
);

router.delete(
  "/:pid/subtask/:sid/delete",
  verifyUser,
  checkPermission("delete_subtask"),
  deleteSubTask,
);

// attachements

router.post(
  "/:pid/task/:tid/attachments/add",
  verifyUser,
  checkPermission("add_attachements"),
  uploadTaskAttachments,
  addAttachments,
);

router.delete(
  "/:pid/attachments/:aid/delete",
  verifyUser,
  checkPermission("delete_attachements"),
  deleteAttachments,
);
export default router;
