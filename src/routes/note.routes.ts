import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../controllers/note.controllers";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router();

router.post(
  "/:pid/notes/create",
  verifyUser,
  checkPermission("add_notes"),
  createNote,
);
router.patch(
  "/:pid/notes/:nid/update",
  verifyUser,
  checkPermission("update_notes"),
  updateNote,
);
router.delete(
  "/:pid/notes/:nid/delete",
  verifyUser,
  checkPermission("delete_notes"),
  deleteNote,
);
router.get("/:pid/notes", verifyUser, checkPermission("view_notes"), getNotes);
router.get(
  "/:pid/notes/:nid",
  verifyUser,
  checkPermission("view_notes"),
  getNoteById,
);

export default router;
