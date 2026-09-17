import { z } from "zod";

export const userRoleSchema = z.enum([
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MEMBER",
]);

export const updateUserRoleSchema = z
  .object({
    roleId: z
      .string()
      .uuid("Invalid role."),
  })
  .strict();

export const createInvitationSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address.")
      .max(
        255,
        "Email address is too long.",
      ),
    roleKey: userRoleSchema.default(
      "MEMBER",
    ),
  })
  .strict();

export type UserRoleKey = z.infer<
  typeof userRoleSchema
>;

export type UpdateUserRoleInput =
  z.infer<typeof updateUserRoleSchema>;

export type CreateInvitationInput =
  z.infer<
    typeof createInvitationSchema
  >;