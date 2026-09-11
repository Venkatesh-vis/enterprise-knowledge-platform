"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/app/shared/ui/button";
import { FieldError } from "@/app/shared/ui/field-error";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { SocialButton } from "@/app/shared/ui/social-button";
import { apiRequest } from "@/app/shared/lib/api";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),

  password: z
    .string()
    .min(1, "Password is required."),
});

type LoginFormValues =
  z.infer<typeof loginSchema>;

type LoginResponse = {
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
    };
    membership: {
      id: string;
      role: string;
    };
  };
};

export function LoginForm() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },

    mode: "onBlur",
  });

  async function onSubmit(
    values: LoginFormValues,
  ) {
    setServerError(null);

    try {
      await apiRequest<LoginResponse>({
        path: "/api/auth/login",
        method: "POST",
        body: values,
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError =
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

        setServerError(
          axiosError.response?.data?.message ??
            "Unable to sign in. Please check your credentials and try again.",
        );

        return;
      }

      setServerError(
        "Unable to connect to the server. Please check your connection and try again.",
      );
    }
  }

  function handleGoogleSignIn() {
    setServerError(
      "Google sign-in is not available yet.",
    );
  }

  return (
    <section
      aria-labelledby="login-title"
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
            id="login-title"
            className="mt-5 text-2xl font-semibold tracking-tight text-slate-950"
          >
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to continue to your knowledge workspace.
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {serverError}
          </div>
        )}

        {/* Google */}
        <div className="mt-8">
          <SocialButton
            provider="google"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          />
        </div>

        {/* Divider */}
        <div
          aria-hidden="true"
          className="my-6 flex items-center gap-4"
        >
          <div className="h-px flex-1 bg-slate-200" />

          <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-slate-400">
            Or continue with email
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <Label
              htmlFor="login-email"
              required
            >
              Work email
            </Label>

            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              disabled={isSubmitting}
              {...register("email")}
              error={!!errors.email}
              aria-describedby={
                errors.email
                  ? "login-email-error"
                  : undefined
              }
            />

            <FieldError
              id="login-email-error"
              message={errors.email?.message}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="login-password"
                required
              >
                Password
              </Label>

              <span className="shrink-0 text-xs text-slate-400">
                Password recovery coming soon
              </span>
            </div>

            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isSubmitting}
              {...register("password")}
              error={!!errors.password}
              aria-describedby={
                errors.password
                  ? "login-password-error"
                  : undefined
              }
            />

            <FieldError
              id="login-password-error"
              message={errors.password?.message}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer"
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign in"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
