import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const Organization = sequelize.define(
  "Organizatin",
  {
    id: { type: DataTypes.STRING(191), primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    planKey: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "starter" },
    billingCycle: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "monthly" },
    subscriptionStatus: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "TRIAL" },
    currentPeriodStart: { type: DataTypes.DATE, allowNull: true },
    currentPeriodEnd: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "organizations",
    timestamps: true,
    indexes: [{ unique: true, fields: ["slug"] }],
  },
);

export default Organization;
