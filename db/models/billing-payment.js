import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingPayment = sequelize.define("BillingPayment", {
  id: { type: DataTypes.STRING(36), primaryKey: true },
  organizationId: { type: DataTypes.STRING(191), allowNull: false },
  subscriptionId: { type: DataTypes.STRING(36) },
  userId: { type: DataTypes.STRING(191), allowNull: false },
  razorpayPaymentId: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  razorpayOrderId: { type: DataTypes.STRING(100), unique: true },
  razorpayInvoiceId: { type: DataTypes.STRING(100) },
  amount: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  status: { type: DataTypes.ENUM("CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"), allowNull: false, defaultValue: "CREATED" },
  method: { type: DataTypes.STRING(50) },
  capturedAt: { type: DataTypes.DATE },
  failureCode: { type: DataTypes.STRING(100) },
  failureReason: { type: DataTypes.STRING(500) },
  refundedAmount: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
  metadata: { type: DataTypes.JSON },
}, { tableName: "billing_payments", timestamps: true, indexes: [{ fields: ["organizationId", "createdAt"] }, { fields: ["subscriptionId", "createdAt"] }] });

export default BillingPayment;
