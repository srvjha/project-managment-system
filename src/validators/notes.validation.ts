import { z } from "zod";
import { UserRolesEnum } from "../utils/constants";

const NoteSchema = z.object({
  content: z.string().trim().nonempty({ message: "Note Content is required" }),
});

// types
type ProjectData = z.infer<typeof NoteSchema>;

const validateNoteData = (data: ProjectData) => {
  return NoteSchema.safeParse(data);
};

export { validateNoteData };
