import { z } from "zod";
import { TaskStatusEnum } from "../utils/constants";

const taskSchema = z.object({
  title: z.string().trim().nonempty("Title field is required"),
  description: z.string().trim().optional(),
  email: z.string().trim().email({ message: "Email is required" }),
});

const subTaskSchema = taskSchema.pick({ title: true });
const updateSubTaskSchema = subTaskSchema
  .extend({
    isCompleted: z.boolean(),
  })
  .partial();

const updateTaskSchema = taskSchema
  .extend({
    status: z.enum(
      [TaskStatusEnum.TODO, TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.DONE],
      {
        message: "Status must be either 'todo', 'in_progress' or 'done'",
      },
    ),
  })
  .partial();

// types
type TaskData = z.infer<typeof taskSchema>;
type UpdateTaskData = z.infer<typeof updateTaskSchema>;
type SubTaskData = z.infer<typeof subTaskSchema>;
type UpdateSubTaskData = z.infer<typeof updateSubTaskSchema>;

const validateTaskData = (data: TaskData) => {
  return taskSchema.safeParse(data);
};

const validateUpdateTaskData = (data: UpdateTaskData) => {
  return updateTaskSchema.safeParse(data);
};

const validateSubTaskData = (data: SubTaskData) => {
  return subTaskSchema.safeParse(data);
};

const validateUpdateSubTaskData = (data: UpdateSubTaskData) => {
  return updateSubTaskSchema.safeParse(data);
};

export {
  validateTaskData,
  validateUpdateTaskData,
  validateSubTaskData,
  validateUpdateSubTaskData,
};
