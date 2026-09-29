import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingSubscription = sequelize.define(
  "BillingSubscription",
  {
    id: { type: DataTypes.STRING(191), primaryKey: true, allowNull: false },
    organizationId: { type: DataTypes.STRING(191), allowNull: false },
    planKey: { type: DataTypes.STRING(30), allowNull: false },
    billingCycle: { type: DataTypes.STRING(20), allowNull: false },
    status: { type: DataTypes.STRING(30), allowNull: false },
    amountPaise: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "INR" },
    razorpayPlanId: { type: DataTypes.STRING(100), allowNull: true },
    razorpaySubscriptionId: { type: DataTypes.STRING(100), allowNull: true, unique: true },
    razorpayPaymentId: { type: DataTypes.STRING(100), allowNull: true },
    currentPeriodStart: { type: DataTypes.DATE, allowNull: true },
    currentPeriodEnd: { type: DataTypes.DATE, allowNull: true },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    endedAt: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
  },
  {
    tableName: "billing_subscriptions",
    timestamps: true,
    indexes: [
      { fields: ["organizationId", "status"] },
      { unique: true, fields: ["razorpaySubscriptionId"] },
    ],
  },
);

export default BillingSubscription;
