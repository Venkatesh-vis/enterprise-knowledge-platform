import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingWebhookEvent = sequelize.define(
  "BillingWebhookEvent",
  {
    id: { type: DataTypes.STRING(191), primaryKey: true, allowNull: false },
    razorpayEventId: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    eventType: { type: DataTypes.STRING(100), allowNull: false },
    status: { type: DataTypes.STRING(30), allowNull: false },
    payload: { type: DataTypes.JSON, allowNull: false },
    processedAt: { type: DataTypes.DATE, allowNull: true },
    errorMessage: { type: DataTypes.STRING(1000), allowNull: true },
  },
  {
    tableName: "billing_webhook_events",
    timestamps: true,
  },
);

export default BillingWebhookEvent;
