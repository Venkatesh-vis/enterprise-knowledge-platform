import type { Metadata } from "next";

import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Enterprise Knowledge Platform account.",
};

export default function LoginPage() {
  return <LoginForm />;
}