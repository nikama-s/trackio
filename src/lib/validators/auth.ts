import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .refine(
        (password) => /[a-zA-Z]/.test(password) && /[0-9]/.test(password),
        { message: "Password must contain at least one letter and one number" }
      ),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });
