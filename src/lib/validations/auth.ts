// src/lib/validations/auth.ts
import { z } from 'zod';

// Schema for Login Form
export const LoginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }), // Basic check, server handles complexity
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Schema for Registration Form
export const RegisterSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
    dateOfBirth: z.date().optional().nullable(), // Optional date
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER", "PREFER_NOT_SAY"]).optional().nullable(),
    fatherName: z.string().max(100).optional().nullable(),
    motherName: z.string().max(100).optional().nullable(),
    phoneNumber: z.string().optional().nullable(), // Validation handled by react-phone-number-input ideally
    // countryCode: z.string().optional(), // Often derived from phoneNumber
    // country: z.string().optional(), // Often derived from phoneNumber
    inviteCode: z.string().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Path of error
});

export type RegisterInput = z.infer<typeof RegisterSchema>;