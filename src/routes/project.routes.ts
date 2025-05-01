import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controllers";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router()

router.post("/create", verifyUser,createProject);
router.put("/update/:projectId",verifyUser,checkPermission("update_project"),updateProject)
router.delete("/delete/:projectId",verifyUser,checkPermission("delete_project"),deleteProject)
router.get("/get-all-projects", verifyUser, getProjects);
router.get("/get-project/:projectId", verifyUser, checkPermission("view_project"), getProjectById);
router.post("/add-member/:projectId", verifyUser, checkPermission("add_members"), addMemberToProject);
router.delete("/delete-member/:projectId",verifyUser,checkPermission("remove_members"),deleteMember)
router.get("/get-project-members/:projectId", verifyUser, checkPermission("view_project"), getProjectMembers);
router.put("/update-role/:projectId",verifyUser,checkPermission("update_role"),updateMemberRole);


export default router