import type {
  Permission,
  Role,
} from "@/app/shared/lib/permissions";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type AuthOrganization = {
  id: string;
  name: string;
  slug: string;
};

export type AuthMembership = {
  id: string;
  roleId: string;
  role: Role;
};

export type AuthSnapshot = {
  user: AuthUser;
  organization: AuthOrganization;
  membership: AuthMembership;
  permissions: Permission[];
};