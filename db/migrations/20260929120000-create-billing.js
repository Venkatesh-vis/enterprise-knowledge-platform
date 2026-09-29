"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("organizations", "planKey", { type: Sequelize.STRING(30), allowNull: false, defaultValue: "starter" });
    await queryInterface.addColumn("organizations", "billingCycle", { type: Sequelize.STRING(20), allowNull: false, defaultValue: "monthly" });
    await queryInterface.addColumn("organizations", "subscriptionStatus", { type: Sequelize.STRING(30), allowNull: false, defaultValue: "TRIAL" });
    await queryInterface.addColumn("organizations", "currentPeriodStart", { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn("organizations", "currentPeriodEnd", { type: Sequelize.DATE, allowNull: true });

    await queryInterface.createTable("billing_subscriptions", {
      id: { type: Sequelize.STRING(191), primaryKey: true, allowNull: false },
      organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
      planKey: { type: Sequelize.STRING(30), allowNull: false }, billingCycle: { type: Sequelize.STRING(20), allowNull: false }, status: { type: Sequelize.STRING(30), allowNull: false },
      amountPaise: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }, currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: "INR" },
      razorpayPlanId: { type: Sequelize.STRING(100), allowNull: true }, razorpaySubscriptionId: { type: Sequelize.STRING(100), allowNull: true }, razorpayPaymentId: { type: Sequelize.STRING(100), allowNull: true },
      currentPeriodStart: { type: Sequelize.DATE, allowNull: true }, currentPeriodEnd: { type: Sequelize.DATE, allowNull: true }, startedAt: { type: Sequelize.DATE, allowNull: true }, endedAt: { type: Sequelize.DATE, allowNull: true }, metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("billing_subscriptions", ["organizationId", "status"]);
    await queryInterface.addIndex("billing_subscriptions", ["razorpaySubscriptionId"], { unique: true, name: "billing_subscriptions_razorpay_unique" });

    await queryInterface.createTable("billing_invoices", {
      id: { type: Sequelize.STRING(191), primaryKey: true, allowNull: false }, organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" }, subscriptionId: { type: Sequelize.STRING(191), allowNull: true },
      razorpayInvoiceId: { type: Sequelize.STRING(100), allowNull: false }, invoiceNumber: { type: Sequelize.STRING(100), allowNull: true }, status: { type: Sequelize.STRING(30), allowNull: false }, amountPaise: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }, amountPaidPaise: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 }, currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: "INR" },
      paymentId: { type: Sequelize.STRING(100), allowNull: true }, hostedUrl: { type: Sequelize.STRING(1000), allowNull: true }, issuedAt: { type: Sequelize.DATE, allowNull: true }, paidAt: { type: Sequelize.DATE, allowNull: true }, customerName: { type: Sequelize.STRING(255), allowNull: false }, customerEmail: { type: Sequelize.STRING(255), allowNull: false }, details: { type: Sequelize.JSON, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("billing_invoices", ["razorpayInvoiceId"], { unique: true, name: "billing_invoices_razorpay_unique" });
    await queryInterface.addIndex("billing_invoices", ["organizationId", "createdAt"]);

    await queryInterface.createTable("billing_webhook_events", {
      id: { type: Sequelize.STRING(191), primaryKey: true, allowNull: false }, razorpayEventId: { type: Sequelize.STRING(191), allowNull: false }, eventType: { type: Sequelize.STRING(100), allowNull: false }, status: { type: Sequelize.STRING(30), allowNull: false }, payload: { type: Sequelize.JSON, allowNull: false }, processedAt: { type: Sequelize.DATE, allowNull: true }, errorMessage: { type: Sequelize.STRING(1000), allowNull: true }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("billing_webhook_events", ["razorpayEventId"], { unique: true, name: "billing_webhook_events_razorpay_unique" });

    const [organizations] = await queryInterface.sequelize.query("SELECT id FROM organizations");
    const now = new Date(); const trialEnd = new Date(now); trialEnd.setDate(trialEnd.getDate() + 14);
    if (organizations.length) await queryInterface.bulkUpdate("organizations", { planKey: "starter", billingCycle: "monthly", subscriptionStatus: "TRIAL", currentPeriodStart: now, currentPeriodEnd: trialEnd }, {});
  },

  async down(queryInterface) {
    await queryInterface.dropTable("billing_webhook_events"); await queryInterface.dropTable("billing_invoices"); await queryInterface.dropTable("billing_subscriptions");
    await queryInterface.removeColumn("organizations", "currentPeriodEnd"); await queryInterface.removeColumn("organizations", "currentPeriodStart"); await queryInterface.removeColumn("organizations", "subscriptionStatus"); await queryInterface.removeColumn("organizations", "billingCycle"); await queryInterface.removeColumn("organizations", "planKey");
  },
};
