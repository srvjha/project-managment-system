import { z } from "zod";
import { allowedMimeTypes, TaskStatusEnum } from "../utils/constants";

const taskSchema = z.object({
  title: z.string().trim().nonempty("Title field is required"),
  description: z.string().trim().optional(),
  email: z.string().trim().email({ message: "Email is required" })
});



const updateTaskSchema = taskSchema
.extend({
  status: z.enum(
    ["TODO", "IN_PROGRESS", "DONE"], 
    {
      message: "Status must be either 'todo', 'in_progress' or 'done'",
    },
  ),
})
.partial();

// types
type TaskData = z.infer<typeof taskSchema>;
type UpdateTaskData = z.infer<typeof updateTaskSchema>

const validateTaskData = (data: TaskData) => {
  return taskSchema.safeParse(data);
};

const validateUpdateTaskData = (data: UpdateTaskData) => {
  return updateTaskSchema.safeParse(data);
};

export { validateTaskData,validateUpdateTaskData };
