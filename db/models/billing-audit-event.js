import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingAuditEvent = sequelize.define("BillingAuditEvent", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  organizationId: { type: DataTypes.STRING(191), allowNull: false },
  actorUserId: { type: DataTypes.STRING(191) },
  eventType: { type: DataTypes.STRING(100), allowNull: false },
  resourceId: { type: DataTypes.STRING(191) },
  metadata: { type: DataTypes.JSON },
  createdAt: { type: DataTypes.DATE, allowNull: false },
}, { tableName: "billing_audit_events", timestamps: false, indexes: [{ fields: ["organizationId", "createdAt"] }] });

export default BillingAuditEvent;
