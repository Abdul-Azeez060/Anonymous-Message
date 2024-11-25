import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "username must be atleast 2 characters ")
  .max(20, "username must be max of 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character");

export const userSignupSchema = z.object({
  username: usernameValidation,
  email: z.string().email("Invalid email entered"),
  password: z.string().min(6, "password should be minimum 6 characters"),
});

export const verifySchema = z.object({
  username: usernameValidation,
  code: z.string().length(6, "the code must be of length 6"),
});

export const userSigninSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

export const acceptMessageSchema = z.object({
  acceptMessages: z.boolean(),
});

export const messageSchmea = z.object({
  content: z.string().min(10, "Content should be min of 10 characters"),
});
