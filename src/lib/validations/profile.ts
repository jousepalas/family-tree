// src/lib/validations/profile.ts
import { z } from 'zod';

// Schema for Updating User Profile
export const UpdateProfileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100).optional(),
    // email: z.string().email().optional(), // Usually email change requires verification, handle separately
    dateOfBirth: z.date().optional().nullable(),
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER", "PREFER_NOT_SAY"]).optional().nullable(),
    fatherName: z.string().max(100).optional().nullable(),
    motherName: z.string().max(100).optional().nullable(),
    phoneNumber: z.string().optional().nullable(), // Basic string validation, specific format checked by component/server
    // countryCode: z.string().optional(),
    // country: z.string().optional(),
    isProfilePublic: z.boolean().optional(),
    image: z.string().url({ message: "Please enter a valid URL." }).optional().nullable(), // Assuming image is handled as URL
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;


// Schema for Adding Manual Member
export const AddManualMemberSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }).max(100),
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER", "PREFER_NOT_SAY"]).optional().nullable(),
    dateOfBirth: z.date().optional().nullable(),
    // Relationship of this new person TO the logged-in user adding them
    relationshipToAdder: z.enum(["PARENT", "CHILD", "SPOUSE", "SIBLING" /* Add others */ ], {
        required_error: "Relationship to you is required.",
    }),
});

export type AddManualMemberInput = z.infer<typeof AddManualMemberSchema>;