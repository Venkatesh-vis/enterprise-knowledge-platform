import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingIdempotencyKey = sequelize.define("BillingIdempotencyKey", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  organizationId: { type: DataTypes.STRING(191), allowNull: false },
  userId: { type: DataTypes.STRING(191), allowNull: false },
  operation: { type: DataTypes.STRING(100), allowNull: false },
  idempotencyKey: { type: DataTypes.STRING(191), allowNull: false },
  response: { type: DataTypes.JSON, allowNull: false },
}, { tableName: "billing_idempotency_keys", timestamps: true });

export default BillingIdempotencyKey;
