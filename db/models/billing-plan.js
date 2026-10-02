import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingPlan = sequelize.define("BillingPlan", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(500) },
  razorpayPlanId: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  billingInterval: { type: DataTypes.ENUM("MONTHLY", "YEARLY"), allowNull: false },
  price: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "INR" },
  features: { type: DataTypes.JSON, allowNull: false },
  limits: { type: DataTypes.JSON, allowNull: false },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  metadata: { type: DataTypes.JSON },
}, { tableName: "billing_plans", timestamps: true, indexes: [{ fields: ["active", "billingInterval"] }] });

export default BillingPlan;
