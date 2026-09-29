import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const BillingInvoice = sequelize.define(
  "BillingInvoice",
  {
    id: { type: DataTypes.STRING(191), primaryKey: true, allowNull: false },
    organizationId: { type: DataTypes.STRING(191), allowNull: false },
    subscriptionId: { type: DataTypes.STRING(191), allowNull: true },
    razorpayInvoiceId: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    invoiceNumber: { type: DataTypes.STRING(100), allowNull: true },
    status: { type: DataTypes.STRING(30), allowNull: false },
    amountPaise: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    amountPaidPaise: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "INR" },
    paymentId: { type: DataTypes.STRING(100), allowNull: true },
    hostedUrl: { type: DataTypes.STRING(1000), allowNull: true },
    issuedAt: { type: DataTypes.DATE, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    customerName: { type: DataTypes.STRING(255), allowNull: false },
    customerEmail: { type: DataTypes.STRING(255), allowNull: false },
    details: { type: DataTypes.JSON, allowNull: false },
  },
  {
    tableName: "billing_invoices",
    timestamps: true,
    indexes: [
      { fields: ["organizationId", "createdAt"] },
      { unique: true, fields: ["razorpayInvoiceId"] },
    ],
  },
);

export default BillingInvoice;
