"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/app/shared/ui/button";
import { FieldError } from "@/app/shared/ui/field-error";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { SocialButton } from "@/app/shared/ui/social-button";

const invitationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters.",
      )
      .max(
        100,
        "Name must be 100 characters or less.",
      ),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters.",
      )
      .max(
        128,
        "Password must be 128 characters or less.",
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        "Please confirm your password.",
      ),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    },
  );

type InvitationFormValues =
  z.infer<typeof invitationSchema>;

interface InvitationAcceptFormProps {
  token: string;
  invitedEmail: string;
}

export function InvitationAcceptForm({
  token,
  invitedEmail,
}: InvitationAcceptFormProps) {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),

    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },

    mode: "onBlur",
  });

  async function onSubmit(
    values: InvitationFormValues,
  ) {
    console.log("Accept invitation:", {
      token,
      invitedEmail,
      ...values,
    });

    /*
     * Server Action will be connected next.
     *
     * Server responsibilities:
     *
     * 1. Validate invitation token.
     * 2. Hash the token and look it up.
     * 3. Check expiration.
     * 4. Check invitation status.
     * 5. Verify invited email.
     * 6. Check whether account already exists.
     * 7. Create user.
     * 8. Hash password.
     * 9. Create organization membership.
     * 10. Assign role from invitation.
     * 11. Mark invitation as accepted.
     * 12. Create session.
     * 13. Redirect to dashboard.
     */
  }

  function handleGoogleAccept() {
    console.log(
      "Google invitation acceptance:",
      token,
    );

    /*
     * OAuth callback will verify:
     *
     * Google email === invitation.email
     *
     * The role comes from the invitation.
     * The user cannot choose it.
     */
  }

  return (
    <div className="mt-7">
      <SocialButton
        provider="google"
        onClick={handleGoogleAccept}
        disabled={isSubmitting}
      />

      <div
        aria-hidden="true"
        className="my-6 flex items-center gap-4"
      >
        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Or create with email
        </span>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        {/* Email */}
        <div>
          <Label htmlFor="invitation-email">
            Email
          </Label>

          <Input
            id="invitation-email"
            type="email"
            value={invitedEmail}
            disabled
            readOnly
            autoComplete="email"
            className="cursor-not-allowed bg-slate-50 text-slate-500"
          />

          <p className="mt-1.5 text-xs text-slate-400">
            This invitation is tied to this email address.
          </p>
        </div>

        {/* Name */}
        <div>
          <Label
            htmlFor="invitation-name"
            required
          >
            Full name
          </Label>

          <Input
            id="invitation-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            {...register("name")}
            error={!!errors.name}
            aria-describedby={
              errors.name
                ? "invitation-name-error"
                : undefined
            }
          />

          <FieldError
            id="invitation-name-error"
            message={errors.name?.message}
          />
        </div>

        {/* Password */}
        <div>
          <Label
            htmlFor="invitation-password"
            required
          >
            Create password
          </Label>

          <div className="relative">
            <Input
              id="invitation-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register("password")}
              error={!!errors.password}
              aria-describedby={
                errors.password
                  ? "invitation-password-error"
                  : undefined
              }
              className="pr-11"
            />

            <button
              type="button"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowPassword(
                  (current) => !current,
                )
              }
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
            >
              {showPassword ? (
                <EyeOff
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <FieldError
            id="invitation-password-error"
            message={errors.password?.message}
          />
        </div>

        {/* Confirm password */}
        <div>
          <Label
            htmlFor="invitation-confirm-password"
            required
          >
            Confirm password
          </Label>

          <div className="relative">
            <Input
              id="invitation-confirm-password"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="Re-enter your password"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword
                  ? "invitation-confirm-password-error"
                  : undefined
              }
              className="pr-11"
            />

            <button
              type="button"
              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowConfirmPassword(
                  (current) => !current,
                )
              }
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
            >
              {showConfirmPassword ? (
                <EyeOff
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <FieldError
            id="invitation-confirm-password-error"
            message={
              errors.confirmPassword?.message
            }
          />
        </div>

        {/* Security note */}
        <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <LockKeyhole
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
            aria-hidden="true"
          />

          <p className="text-xs leading-5 text-slate-500">
            Your password is securely hashed before
            being stored. Never share your password with
            another person.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Joining organization..."
            : "Accept invitation"}
        </Button>
      </form>
    </div>
  );
}