import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const RolePermission = sequelize.define(
  "RolePermission",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
    permissionId: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
  },
  {
    tableName: "role_permissions",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["roleId", "permissionId"] },
      { fields: ["permissionId"] },
    ],
  },
);

export default RolePermission;

