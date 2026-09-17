import User from "./user";
import Organization from "./organization";
import OrganizationMembership from "./organization-membership";
import Document from "./document";
import Role from "./role";
import Permission from "./permission";
import RolePermission from "./role-permission";
import AuditLog from "./audit-log";

User.hasMany(OrganizationMembership, {
  foreignKey: "userId",
  as: "memberships",
});

Organization.hasMany(OrganizationMembership, {
  foreignKey: "organizationId",
  as: "memberships",
});

OrganizationMembership.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

OrganizationMembership.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

OrganizationMembership.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

Role.hasMany(OrganizationMembership, {
  foreignKey: "roleId",
  as: "memberships",
});

Role.hasMany(RolePermission, {
  foreignKey: "roleId",
  as: "rolePermissions",
});

Permission.hasMany(RolePermission, {
  foreignKey: "permissionId",
  as: "rolePermissions",
});

RolePermission.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

RolePermission.belongsTo(Permission, {
  foreignKey: "permissionId",
  as: "permission",
});

Organization.hasMany(Role, {
  foreignKey: "organizationId",
  as: "roles",
});

Role.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

AuditLog.belongsTo(User, {
  foreignKey: "actorUserId",
  as: "actor",
});

AuditLog.belongsTo(User, {
  foreignKey: "targetUserId",
  as: "targetUser",
});

AuditLog.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

User.hasMany(AuditLog, {
  foreignKey: "actorUserId",
  as: "auditLogs",
});

Organization.hasMany(AuditLog, {
  foreignKey: "organizationId",
  as: "auditLogs",
});

export {
  User,
  Organization,
  OrganizationMembership,
  Document,
  Role,
  Permission,
  RolePermission,
  AuditLog,
};
