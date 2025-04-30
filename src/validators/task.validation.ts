import { z } from "zod";

const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  project:z.obj
});

const loginSchema = registerSchema.omit({
  fullName: true,
  username: true,
  avatar: true,
});

// types
type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

const validateRegisterData = (data: RegisterData) => {
  return registerSchema.safeParse(data);
};

const validateLoginData = (data: LoginData) => {
  return loginSchema.safeParse(data);
};

export { validateRegisterData, validateLoginData };
