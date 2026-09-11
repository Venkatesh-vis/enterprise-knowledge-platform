import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const OrganizationMembership = sequelize.define(
  "OrganizationMembership",
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
    },

    userId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    organizationId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM(
        "OWNER",
        "ADMIN",
        "MANAGER",
        "MEMBER",
      ),
      allowNull: false,
      defaultValue: "MEMBER",
    },
  },
  {
    tableName: "organization_memberships",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["userId", "organizationId"],
      },
      {
        fields: ["organizationId"],
      },
      {
        fields: ["userId"],
      },
    ],
  },
);

export default OrganizationMembership;