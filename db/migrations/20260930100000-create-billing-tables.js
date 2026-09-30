"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("billing_plans", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.STRING(500), allowNull: true },
      razorpayPlanId: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      billingInterval: { type: Sequelize.ENUM("MONTHLY", "YEARLY"), allowNull: false },
      price: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: "INR" },
      features: { type: Sequelize.JSON, allowNull: false },
      limits: { type: Sequelize.JSON, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("subscriptions", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      planId: { type: Sequelize.STRING(36), allowNull: false, references: { model: "billing_plans", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
      razorpaySubscriptionId: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      razorpayCustomerId: { type: Sequelize.STRING(100), allowNull: true },
      status: { type: Sequelize.ENUM("CREATED", "AUTHENTICATED", "ACTIVE", "PENDING", "HALTED", "CANCELLED", "COMPLETED"), allowNull: false, defaultValue: "CREATED" },
      currentPeriodStart: { type: Sequelize.DATE, allowNull: true },
      currentPeriodEnd: { type: Sequelize.DATE, allowNull: true },
      cancelledAt: { type: Sequelize.DATE, allowNull: true },
      cancelAtPeriodEnd: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      scheduledPlanId: { type: Sequelize.STRING(36), allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("subscriptions", ["organizationId", "status"], { name: "subscriptions_organization_status_idx" });
    await queryInterface.addIndex("subscriptions", ["organizationId", "currentPeriodEnd"], { name: "subscriptions_organization_period_end_idx" });

    await queryInterface.createTable("billing_payments", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      subscriptionId: { type: Sequelize.STRING(36), allowNull: true, references: { model: "subscriptions", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
      userId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
      razorpayPaymentId: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      razorpayOrderId: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      razorpayInvoiceId: { type: Sequelize.STRING(100), allowNull: true },
      amount: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false },
      status: { type: Sequelize.ENUM("CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"), allowNull: false, defaultValue: "CREATED" },
      method: { type: Sequelize.STRING(50), allowNull: true },
      capturedAt: { type: Sequelize.DATE, allowNull: true },
      failureCode: { type: Sequelize.STRING(100), allowNull: true },
      failureReason: { type: Sequelize.STRING(500), allowNull: true },
      refundedAmount: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("billing_payments", ["organizationId", "createdAt"], { name: "billing_payments_organization_created_idx" });
    await queryInterface.addIndex("billing_payments", ["subscriptionId", "createdAt"], { name: "billing_payments_subscription_created_idx" });

    await queryInterface.createTable("billing_idempotency_keys", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      userId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      operation: { type: Sequelize.STRING(100), allowNull: false },
      idempotencyKey: { type: Sequelize.STRING(191), allowNull: false },
      response: { type: Sequelize.JSON, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("billing_idempotency_keys", ["organizationId", "operation", "idempotencyKey"], { unique: true, name: "billing_idempotency_unique" });

    await queryInterface.createTable("billing_webhook_events", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      eventId: { type: Sequelize.STRING(191), allowNull: false, unique: true },
      eventType: { type: Sequelize.STRING(100), allowNull: false },
      payload: { type: Sequelize.JSON, allowNull: false },
      signature: { type: Sequelize.STRING(255), allowNull: false },
      processingStatus: { type: Sequelize.ENUM("RECEIVED", "PROCESSED", "FAILED"), allowNull: false, defaultValue: "RECEIVED" },
      processedAt: { type: Sequelize.DATE, allowNull: true },
      failureReason: { type: Sequelize.STRING(1000), allowNull: true },
      retryCount: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("billing_webhook_events", ["eventType", "createdAt"], { name: "billing_webhook_event_type_created_idx" });
    await queryInterface.addIndex("billing_webhook_events", ["processingStatus", "createdAt"], { name: "billing_webhook_status_created_idx" });

    await queryInterface.createTable("billing_usage_counters", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      resource: { type: Sequelize.STRING(100), allowNull: false },
      periodKey: { type: Sequelize.STRING(20), allowNull: false },
      used: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("billing_usage_counters", ["organizationId", "resource", "periodKey"], { unique: true, name: "billing_usage_counter_unique" });

    await queryInterface.createTable("billing_audit_events", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      actorUserId: { type: Sequelize.STRING(191), allowNull: true },
      eventType: { type: Sequelize.STRING(100), allowNull: false },
      resourceId: { type: Sequelize.STRING(191), allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("billing_audit_events", ["organizationId", "createdAt"], { name: "billing_audit_events_org_created_idx" });

    const now = new Date();
    await queryInterface.bulkInsert("billing_plans", [
      { id: randomUUID(), name: "Free", description: "Free plan", razorpayPlanId: "CONFIGURE_FREE_PLAN", billingInterval: "MONTHLY", price: 0, currency: "INR", features: ["KNOWLEDGE_BASE", "DOCUMENT_UPLOAD"], limits: { documents: 10, knowledge_bases: 1, team_members: 1, ai_queries_month: 20, storage_mb: 100 }, active: true, metadata: { system: true }, createdAt: now, updatedAt: now },
      { id: randomUUID(), name: "Pro", description: "Professional plan", razorpayPlanId: "CONFIGURE_PRO_MONTHLY_PLAN", billingInterval: "MONTHLY", price: 99900, currency: "INR", features: ["KNOWLEDGE_BASE", "ADVANCED_SEARCH", "AI_ASSISTANT", "DOCUMENT_UPLOAD", "ANALYTICS", "EXPORT", "TEAM_MEMBERS", "API_ACCESS"], limits: { documents: 1000, knowledge_bases: 20, team_members: 10, ai_queries_month: 1000, storage_mb: 10000 }, active: true, metadata: { system: true }, createdAt: now, updatedAt: now },
      { id: randomUUID(), name: "Enterprise", description: "Enterprise plan", razorpayPlanId: "CONFIGURE_ENTERPRISE_MONTHLY_PLAN", billingInterval: "MONTHLY", price: 499900, currency: "INR", features: ["KNOWLEDGE_BASE", "ADVANCED_SEARCH", "AI_ASSISTANT", "DOCUMENT_UPLOAD", "ANALYTICS", "EXPORT", "TEAM_MEMBERS", "API_ACCESS", "CUSTOM_BRANDING"], limits: { documents: null, knowledge_bases: null, team_members: null, ai_queries_month: null, storage_mb: null }, active: true, metadata: { system: true }, createdAt: now, updatedAt: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("billing_audit_events");
    await queryInterface.dropTable("billing_usage_counters");
    await queryInterface.dropTable("billing_webhook_events");
    await queryInterface.dropTable("billing_idempotency_keys");
    await queryInterface.dropTable("billing_payments");
    await queryInterface.dropTable("subscriptions");
    await queryInterface.dropTable("billing_plans");
  },
};
