import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" }),

  email: z.string().trim().email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(16, { message: "Password must be at most 16 characters long" })
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/, {
      message:
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  avatar: z.string().optional(),
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
