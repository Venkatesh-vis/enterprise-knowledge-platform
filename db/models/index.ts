import User from "./user";
import Organization from "./organization";
import OrganizationMembership from "./organization-membership";
import Document from "./document";
import KnowledgeBase from "./knowledge-base";
import DocumentKnowledgeBase from "./document-knowledge-base";
import Role from "./role";
import Permission from "./permission";
import RolePermission from "./role-permission";
import AuditLog from "./audit-log";
import Invitation from "./invitation";

User.hasMany(OrganizationMembership, { foreignKey: "userId", as: "memberships" });
Organization.hasMany(OrganizationMembership, { foreignKey: "organizationId", as: "memberships" });
OrganizationMembership.belongsTo(User, { foreignKey: "userId", as: "user" });
OrganizationMembership.belongsTo(Organization, { foreignKey: "organizationId", as: "organization" });
OrganizationMembership.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(OrganizationMembership, { foreignKey: "roleId", as: "memberships" });
Role.hasMany(RolePermission, { foreignKey: "roleId", as: "rolePermissions" });
Permission.hasMany(RolePermission, { foreignKey: "permissionId", as: "rolePermissions" });
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "role" });
RolePermission.belongsTo(Permission, { foreignKey: "permissionId", as: "permission" });
Organization.hasMany(Role, { foreignKey: "organizationId", as: "roles" });
Role.belongsTo(Organization, { foreignKey: "organizationId", as: "organization" });
AuditLog.belongsTo(User, { foreignKey: "actorUserId", as: "actor" });
AuditLog.belongsTo(User, { foreignKey: "targetUserId", as: "targetUser" });
AuditLog.belongsTo(Organization, { foreignKey: "organizationId", as: "organization" });
User.hasMany(AuditLog, { foreignKey: "actorUserId", as: "auditLogs" });
Organization.hasMany(AuditLog, { foreignKey: "organizationId", as: "auditLogs" });

Invitation.belongsTo(Organization, { foreignKey: "organizationId", as: "organization" });
Invitation.belongsTo(User, { foreignKey: "invitedByUserId", as: "invitedBy" });
Invitation.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Organization.hasMany(Invitation, { foreignKey: "organizationId", as: "invitations" });

Organization.hasMany(Document, { foreignKey: "organizationId", as: "documents" });
Document.belongsTo(Organization, { foreignKey: "organizationId", as: "organization" });
Document.belongsTo(User, { foreignKey: "uploadedByUserId", as: "uploadedByUser" });
User.hasMany(Document, { foreignKey: "uploadedByUserId", as: "documents" });

Organization.hasMany(KnowledgeBase, { foreignKey: "organizationId", as: "knowledgeBases" });
KnowledgeBase.belongsTo(Organization, { foreignKey: "organizationId", as: "organization" });
KnowledgeBase.belongsTo(User, { foreignKey: "createdByUserId", as: "createdBy" });
User.hasMany(KnowledgeBase, { foreignKey: "createdByUserId", as: "knowledgeBasesCreated" });

Document.belongsToMany(KnowledgeBase, {
  through: DocumentKnowledgeBase,
  foreignKey: "documentId",
  otherKey: "knowledgeBaseId",
  as: "knowledgeBases",
});

KnowledgeBase.belongsToMany(Document, {
  through: DocumentKnowledgeBase,
  foreignKey: "knowledgeBaseId",
  otherKey: "documentId",
  as: "documents",
});

export {
  User,
  Organization,
  OrganizationMembership,
  Document,
  KnowledgeBase,
  DocumentKnowledgeBase,
  Role,
  Permission,
  RolePermission,
  AuditLog,
  Invitation,
};
