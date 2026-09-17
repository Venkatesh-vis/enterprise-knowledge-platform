import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const Permission = sequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "permissions",
    timestamps: true,
    indexes: [{ unique: true, fields: ["key"] }],
  },
);

export default Permission;

