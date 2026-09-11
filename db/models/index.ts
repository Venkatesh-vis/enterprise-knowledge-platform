import User from "./user";
import Organization from "./organization";
import OrganizationMembership from "./organization-membership";
import Document from "./document";


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

export {User,Organization,OrganizationMembership,Document};