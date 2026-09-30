import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const Subscription = sequelize.define("Subscription", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  organizationId: { type: DataTypes.STRING(191), allowNull: false },
  planId: { type: DataTypes.STRING(36), allowNull: false },
  razorpaySubscriptionId: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  razorpayCustomerId: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.ENUM("CREATED", "AUTHENTICATED", "ACTIVE", "PENDING", "HALTED", "CANCELLED", "COMPLETED"), allowNull: false, defaultValue: "CREATED" },
  currentPeriodStart: { type: DataTypes.DATE },
  currentPeriodEnd: { type: DataTypes.DATE },
  cancelledAt: { type: DataTypes.DATE },
  cancelAtPeriodEnd: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  scheduledPlanId: { type: DataTypes.STRING(36) },
  metadata: { type: DataTypes.JSON },
}, { tableName: "subscriptions", timestamps: true, indexes: [{ fields: ["organizationId", "status"] }, { fields: ["organizationId", "currentPeriodEnd"] }] });

export default Subscription;
