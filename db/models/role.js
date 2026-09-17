import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    organizationId: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    isSystemRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["key"] },
      { fields: ["organizationId"] },
    ],
  },
);

export default Role;
