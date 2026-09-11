import type { Metadata } from "next";

import { RegisterForm } from "./components/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your account and start building your organization's knowledge workspace.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}