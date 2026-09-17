export type NotificationType =
  | "ROLE_CHANGED"
  | "REMOVED_FROM_ORGANIZATION";

export type UserNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsData = {
  notifications: UserNotification[];
  unreadCount: number;
};

export type MarkNotificationReadInput = {
  read: boolean;
};