"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/app/shared/ui/button";
import { FieldError } from "@/app/shared/ui/field-error";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { apiRequest } from "@/app/shared/lib/api";

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must be 100 characters or less."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or less."),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password."),
  })
  .refine(
    (value) => value.password === value.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    },
  );

type Values = z.infer<typeof schema>;

type Props = {
  token: string;
  invitedEmail: string;
};

export function InvitationAcceptForm({
  token,
  invitedEmail,
}: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirm, setShowConfirm] =
    useState(false);
  const [serverError, setServerError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: Values) {
    setServerError("");

    try {
      await apiRequest({
        path: "/api/invitations/accept",
        method: "POST",
        body: {
          mode: "new",
          token,
          name: values.name.trim(),
          password: values.password,
        },
      });

      router.replace("/dashboard");
    } catch (error) {
      const value = error as {
        response?: {
          data?: { message?: string };
        };
      };

      setServerError(
        value.response?.data?.message ??
          "Unable to accept the invitation.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-7 space-y-5"
    >
      <div>
        <Label htmlFor="invitation-email">
          Email
        </Label>
        <Input
          id="invitation-email"
          value={invitedEmail}
          disabled
          readOnly
          className="bg-slate-50 text-slate-500"
        />
      </div>

      <div>
        <Label htmlFor="invitation-name" required>
          Full name
        </Label>
        <Input
          id="invitation-name"
          autoComplete="name"
          placeholder="Your full name"
          {...register("name")}
          error={!!errors.name}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="invitation-password" required>
          Create password
        </Label>
        <div className="relative">
          <Input
            id="invitation-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...register("password")}
            error={!!errors.password}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() =>
              setShowPassword((value) => !value)
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400"
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <FieldError message={errors.password?.message} />
      </div>

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
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirm((value) => !value)
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400"
            aria-label="Toggle confirmation visibility"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <FieldError
          message={errors.confirmPassword?.message}
        />
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Creating account..."
          : "Create account & join"}
      </Button>
    </form>
  );
}
