"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/shared/ui/button";
import { FieldError } from "@/app/shared/ui/field-error";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { apiRequest } from "@/app/shared/lib/api";

const registerSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(2, "Organization name must be at least 2 characters.")
      .max(100, "Organization name must be 100 characters or less."),

    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must be 100 characters or less."),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or less."),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password."),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    },
  );

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    };
    membership: {
      id: string;
      role: string;
    };
  };
}

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      const response = await apiRequest<RegisterResponse>({
        path: "/api/auth/register",
        method: "POST",
        body: values,
      });

      if (!response.success) {
        setError("root", {
          message: response.message || "Registration failed.",
        });
        return;
      }

      reset();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to create your organization. Please try again.";

      setError("root", { message });
    }
  }

  return (
    <section
      aria-labelledby="register-title"
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
        {/* Header */}
        <div className="text-center">
          <div
            aria-hidden="true"
            className="mx-auto flex h-11 w-11 items-center justify-center"
          >
            <Image
              src="/icon.svg"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          </div>

          <h1
            id="register-title"
            className="mt-5 text-2xl font-semibold tracking-tight text-slate-950"
          >
            Create your organization
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Set up your workspace and become its initial owner.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 space-y-5"
        >
          {/* Organization */}
          <div>
            <Label htmlFor="register-organization" required>
              Organization name
            </Label>

            <Input
              id="register-organization"
              type="text"
              autoComplete="organization"
              placeholder="Acme Technologies"
              {...register("organizationName")}
              error={!!errors.organizationName}
              aria-describedby={
                errors.organizationName
                  ? "register-organization-error"
                  : undefined
              }
            />

            <FieldError
              id="register-organization-error"
              message={errors.organizationName?.message}
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="register-name" required>
              Full name
            </Label>

            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Venkatesh Vishwanadula"
              {...register("name")}
              error={!!errors.name}
              aria-describedby={
                errors.name
                  ? "register-name-error"
                  : undefined
              }
            />

            <FieldError
              id="register-name-error"
              message={errors.name?.message}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="register-email" required>
              Work email
            </Label>

            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register("email")}
              error={!!errors.email}
              aria-describedby={
                errors.email
                  ? "register-email-error"
                  : undefined
              }
            />

            <FieldError
              id="register-email-error"
              message={errors.email?.message}
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="register-password" required>
              Password
            </Label>

            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register("password")}
              error={!!errors.password}
              aria-describedby={
                errors.password
                  ? "register-password-error"
                  : undefined
              }
            />

            <FieldError
              id="register-password-error"
              message={errors.password?.message}
            />
          </div>

          {/* Confirm password */}
          <div>
            <Label htmlFor="register-confirm-password" required>
              Confirm password
            </Label>

            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword
                  ? "register-confirm-password-error"
                  : undefined
              }
            />

            <FieldError
              id="register-confirm-password-error"
              message={errors.confirmPassword?.message}
            />
          </div>

          {/* Server error */}
          {errors.root?.message && (
            <p role="alert" className="text-sm text-red-600">
              {errors.root.message}
            </p>
          )}

          {/* Terms */}
          <p className="text-xs leading-5 text-slate-500">
            By creating an organization, you agree to
            the platform&apos;s terms and acknowledge the
            privacy policy.
          </p>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Creating organization..."
              : "Create organization"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-3 text-xs text-slate-400">
            Joining an existing organization? Ask your
            organization administrator for an invitation.
          </p>
        </div>
      </div>
    </section>
  );
}