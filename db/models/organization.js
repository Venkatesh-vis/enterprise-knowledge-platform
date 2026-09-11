import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const Organization = sequelize.define(
  "Organizatin",
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "organizations",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["slug"],
      },
    ],
  },
);

export default Organization
