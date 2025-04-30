import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { createNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router()

router.post("/create/:id",verifyUser,checkPermission("add_notes"),createNote)
router.put("/update/:id",verifyUser,checkPermission("update_notes"),updateNote)
router.get("/project/:id",verifyUser,getNotes)
router.get("/:noteid/project/:id",verifyUser,getNoteById)


export default router