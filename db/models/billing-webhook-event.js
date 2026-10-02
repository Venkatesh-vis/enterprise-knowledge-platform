import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingWebhookEvent = sequelize.define("BillingWebhookEvent", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  eventId: { type: DataTypes.STRING(191), allowNull: false, unique: true },
  eventType: { type: DataTypes.STRING(100), allowNull: false },
  payload: { type: DataTypes.JSON, allowNull: false },
  signature: { type: DataTypes.STRING(255), allowNull: false },
  processingStatus: { type: DataTypes.ENUM("RECEIVED", "PROCESSED", "FAILED"), allowNull: false, defaultValue: "RECEIVED" },
  processedAt: { type: DataTypes.DATE },
  failureReason: { type: DataTypes.STRING(1000) },
  retryCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
}, { tableName: "billing_webhook_events", timestamps: true, indexes: [{ fields: ["eventType", "createdAt"] }, { fields: ["processingStatus", "createdAt"] }] });

export default BillingWebhookEvent;
