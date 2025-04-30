import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router()

router.post("/create/project/:id",verifyUser,checkPermission("add_notes"),createNote)
router.put("/update/project/:id",verifyUser,checkPermission("update_notes"),updateNote)
router.delete("/delete/:noteid",verifyUser,checkPermission("delete_notes"),deleteNote)
router.get("/project/:id",verifyUser,checkPermission("view_notes"),getNotes)
router.get("/:noteid/project/:id",verifyUser,checkPermission("view_notes"),getNoteById)


export default router