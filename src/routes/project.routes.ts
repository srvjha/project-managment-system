import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controllers";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router()

router.post("/create", verifyUser,createProject);
router.put("/update/:id",verifyUser,checkPermission("update_project"),updateProject)
router.delete("/delete/:id",verifyUser,checkPermission("delete_project"),deleteProject)
router.get("/get-all-projects", verifyUser, getProjects);
router.get("/get-project/:id", verifyUser, checkPermission("view_project"), getProjectById);
router.post("/add-member/:id", verifyUser, checkPermission("add_members"), addMemberToProject);
router.delete("/delete-member/:id",verifyUser,checkPermission("remove_members"),deleteMember)
router.get("/get-project-members/:id", verifyUser, checkPermission("view_project"), getProjectMembers);
router.put("/update-role/:id",verifyUser,checkPermission("update_role"),updateMemberRole);


export default router