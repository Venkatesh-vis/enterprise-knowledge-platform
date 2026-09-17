import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  NotificationsPage,
} from "@/app/shared/components/notifications/notifications-page";

export default async function NotificationsRoute() {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <NotificationsPage />;
}