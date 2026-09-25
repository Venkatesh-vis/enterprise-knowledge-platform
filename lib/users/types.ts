import type { UserRoleKey } from "@/app/shared/lib/permissions";

export type UserListItem = {
  id: string;
  membershipId: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  roleId: string;
  roleKey: UserRoleKey;
  roleName: string;
  joinedAt: string;
};

export type UserRoleOption = {
  id: string;
  key: UserRoleKey;
  name: string;
  description: string | null;
  isSystemRole: boolean;
};

export type UsersPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type UsersDirectoryStats = {
  total: number;
  owners: number;
  admins: number;
  managers: number;
  members: number;
};

export type UsersDirectoryData = {
  users: UserListItem[];
  pagination: UsersPagination;
  roles: UserRoleOption[];
  stats: UsersDirectoryStats;
  canUpdate: boolean;
  canDelete: boolean;
  currentUserId: string;
  currentRole: UserRoleKey;
};

export type UserDetailData = {
  user: UserListItem;
  organization: { id: string; name: string };
  permissions: UserPermission[];
  roles: UserRoleOption[];
  allowedRoleKeys: UserRoleKey[];
  canUpdate: boolean;
  canDelete: boolean;
  currentUserId: string;
  currentRole: UserRoleKey;
};

export type UserNotification = {
  id: string;
  type: "ROLE_CHANGED" | "REMOVED_FROM_ORGANIZATION";
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type UserPermission = {
  key: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
};

export type UserRoleUpdateResult = {
  user: UserListItem;
  permissions: UserPermission[];
};
