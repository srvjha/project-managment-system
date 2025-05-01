import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router()

router.post("/create/project/:projectId",verifyUser,checkPermission("add_notes"),createNote)
router.patch("/update/:noteId/project/:projectId",verifyUser,checkPermission("update_notes"),updateNote)
router.delete("/delete/:noteId/project/:projectId",verifyUser,checkPermission("delete_notes"),deleteNote)
router.get("/project/:projectId",verifyUser,checkPermission("view_notes"),getNotes)
router.get("/:noteId/project/:projectId",verifyUser,checkPermission("view_notes"),getNoteById)


export default router