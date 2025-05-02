import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router();

router.post("/create", verifyUser, createProject);
router.get("/all", verifyUser, getProjects);

router.get(
  "/:pid",
  verifyUser,
  checkPermission("view_project"),
  getProjectById,
);
router.put(
  "/:pid/update",
  verifyUser,
  checkPermission("update_project"),
  updateProject,
);
router.delete(
  "/:pid/delete",
  verifyUser,
  checkPermission("delete_project"),
  deleteProject,
);

router.post(
  "/:pid/member/add",
  verifyUser,
  checkPermission("add_members"),
  addMemberToProject,
);
router.delete(
  "/:pid/member/:mid/delete",
  verifyUser,
  checkPermission("remove_members"),
  deleteMember,
);
router.get(
  "/:pid/members",
  verifyUser,
  checkPermission("view_project"),
  getProjectMembers,
);
router.put(
  "/:pid/member/:mid/update/role",
  verifyUser,
  checkPermission("update_role"),
  updateMemberRole,
);

export default router;
