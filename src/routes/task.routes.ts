import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { uploadTaskAttachments } from "../middlewares/multer.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { addAttachments, createSubTask, createTask, deleteAttachments, deleteSubTask, deleteTask, getTaskById, getTasks, updateSubTask, updateTask } from "../controllers/task.controllers";

const router = Router();

// task routes
router.post(
  "/create/project/:projectId",
  verifyUser,
  checkPermission("add_task"),
  uploadTaskAttachments,
  createTask,
);

router.patch(
    "/update/:taskId/project/:projectId",
  verifyUser,
  checkPermission("update_task"),
  uploadTaskAttachments,
  updateTask,
)

router.delete(
  "/delete/:taskId/project/:projectId",
  verifyUser,
  checkPermission("delete_task"),
  deleteTask,
)

router.get(
  "/project/:projectId",
  verifyUser,
  checkPermission("view_tasks"),
  getTasks
)

router.get(
  "/:taskId/project/:projectId",
  verifyUser,
  checkPermission("view_tasks"),
  getTaskById
)

// subtask route

router.post(
  "/create-subtask/:taskId/project/:projectId",
  verifyUser,
  checkPermission("add_subtask"),
  createSubTask
)

router.patch(
  "/update-subtask/:subtaskId/project/:projectId",
  verifyUser,
  checkPermission("update_subtask"),
  updateSubTask
)

router.delete(
  "/delete-subtask/:subtaskId/project/:projectId",
  verifyUser,
  checkPermission("delete_subtask"),
  deleteSubTask
)


// attachements

router.post(
  "/add-attachments/task/:taskId/project/:projectId",
  verifyUser,
  checkPermission("add_attachements"),
  uploadTaskAttachments,
  addAttachments
)

router.delete(
  "/delete-attachments/:aid/project/:projectId",
  verifyUser,
  checkPermission("delete_attachements"),
  deleteAttachments
)
export default router;
