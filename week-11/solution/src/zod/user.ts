import { z } from 'zod';

// Password validation regex (minimum 8 characters, at least one uppercase, one lowercase, one digit)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const signupSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long." }) // Minimum length
    .max(30, { message: "Username must be at most 30 characters long." }) // Maximum length
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }), // Allowed characters
  email: z.string()
    .email({ message: "Invalid email format." }), // Email format validation
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." }) // Minimum length
    .regex(passwordRegex, { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number." }), // Password strength validation
});

export const signinSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email format." }), // Email format validation
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." }) // Minimum length
    .regex(passwordRegex, { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number." }), // Password strength validation
});
