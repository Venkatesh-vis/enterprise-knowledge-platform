import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const OrganizationMembership = sequelize.define(
  "OrganizationMembership",
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    roleId: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
  },
  {
    tableName: "organization_memberships",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["userId", "organizationId"] },
      { fields: ["organizationId"] },
      { fields: ["roleId"] },
    ],
  },
);

export default OrganizationMembership;
