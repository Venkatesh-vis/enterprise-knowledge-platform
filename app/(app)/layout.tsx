import { redirect } from "next/navigation";

import Header from "../shared/layout/header";
import Sidebar from "../shared/layout/sidebar";

import { AuthProvider } from "../shared/auth/auth-provider";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";
import { log } from "console";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }
  

  return (
    <AuthProvider initialAuth={currentUser}
    >
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
        <Header />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar />

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hidden">
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}