import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingUsageCounter = sequelize.define("BillingUsageCounter", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  organizationId: { type: DataTypes.STRING(191), allowNull: false },
  resource: { type: DataTypes.STRING(100), allowNull: false },
  periodKey: { type: DataTypes.STRING(20), allowNull: false },
  used: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
}, { tableName: "billing_usage_counters", timestamps: true, indexes: [{ unique: true, fields: ["organizationId", "resource", "periodKey"] }] });

export default BillingUsageCounter;
