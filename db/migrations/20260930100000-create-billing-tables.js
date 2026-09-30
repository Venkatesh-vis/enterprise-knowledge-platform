"use strict";

const { randomUUID } = require("crypto");

const BILLING_TABLES = ["billing_audit_events", "billing_usage_counters", "billing_webhook_events", "billing_idempotency_keys", "billing_payments", "subscriptions", "billing_plans"];

async function tableExists(queryInterface, tableName) {
  const tables = await queryInterface.showAllTables();
  return tables.some((table) => {
    const name = typeof table === "string" ? table : Object.values(table)[0];
    return String(name).toLowerCase() === tableName.toLowerCase();
  });
}

async function ensureTable(queryInterface, tableName, definition) {
  if (!(await tableExists(queryInterface, tableName))) await queryInterface.createTable(tableName, definition);
}

async function ensureColumns(queryInterface, tableName, definition) {
  const columns = await queryInterface.describeTable(tableName);
  for (const [columnName, attributes] of Object.entries(definition)) {
    if (!columns[columnName]) await queryInterface.addColumn(tableName, columnName, attributes);
  }
}

async function ensureIndex(queryInterface, tableName, fields, options = {}) {
  const indexes = await queryInterface.showIndex(tableName);
  const indexName = options.name;
  const alreadyExists = indexes.some((index) => {
    if (indexName && index.name === indexName) return true;
    const indexFields = (index.fields ?? []).map((field) => field.attribute);
    return indexFields.length === fields.length && indexFields.every((field, position) => field === fields[position]);
  });
  if (alreadyExists) return;

  try {
    await queryInterface.addIndex(tableName, fields, options);
  } catch (error) {
    if (error?.original?.code === "ER_DUP_KEYNAME" || error?.original?.errno === 1061) return;
    throw error;
  }
}

async function insertPlanIfMissing(queryInterface, Sequelize, plan) {
  const [existingPlan] = await queryInterface.sequelize.query(
    "SELECT id FROM billing_plans WHERE name = :name LIMIT 1",
    { replacements: { name: plan.name }, type: Sequelize.QueryTypes.SELECT },
  );
  if (!existingPlan) await queryInterface.bulkInsert("billing_plans", [plan]);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinitions = {
      billing_plans: {
        id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false }, name: { type: Sequelize.STRING(100), allowNull: false, unique: true }, description: { type: Sequelize.STRING(500) }, razorpayPlanId: { type: Sequelize.STRING(100), allowNull: false, unique: true }, billingInterval: { type: Sequelize.ENUM("MONTHLY", "YEARLY"), allowNull: false }, price: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }, currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: "INR" }, features: { type: Sequelize.JSON, allowNull: false }, limits: { type: Sequelize.JSON, allowNull: false }, active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }, metadata: { type: Sequelize.JSON }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      subscriptions: {
        id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false }, organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" }, planId: { type: Sequelize.STRING(36), allowNull: false, references: { model: "billing_plans", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" }, razorpaySubscriptionId: { type: Sequelize.STRING(100), allowNull: false, unique: true }, razorpayCustomerId: { type: Sequelize.STRING(100) }, status: { type: Sequelize.ENUM("CREATED", "AUTHENTICATED", "ACTIVE", "PENDING", "HALTED", "CANCELLED", "COMPLETED"), allowNull: false, defaultValue: "CREATED" }, currentPeriodStart: { type: Sequelize.DATE }, currentPeriodEnd: { type: Sequelize.DATE }, cancelledAt: { type: Sequelize.DATE }, cancelAtPeriodEnd: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }, scheduledPlanId: { type: Sequelize.STRING(36) }, metadata: { type: Sequelize.JSON }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      billing_payments: {
        id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false }, organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" }, subscriptionId: { type: Sequelize.STRING(36), references: { model: "subscriptions", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" }, userId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" }, razorpayPaymentId: { type: Sequelize.STRING(100), allowNull: false, unique: true }, razorpayOrderId: { type: Sequelize.STRING(100), unique: true }, razorpayInvoiceId: { type: Sequelize.STRING(100) }, amount: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }, currency: { type: Sequelize.STRING(3), allowNull: false }, status: { type: Sequelize.ENUM("CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"), allowNull: false, defaultValue: "CREATED" }, method: { type: Sequelize.STRING(50) }, capturedAt: { type: Sequelize.DATE }, failureCode: { type: Sequelize.STRING(100) }, failureReason: { type: Sequelize.STRING(500) }, refundedAmount: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 }, metadata: { type: Sequelize.JSON }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      billing_idempotency_keys: {
        id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false }, organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" }, userId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" }, operation: { type: Sequelize.STRING(100), allowNull: false }, idempotencyKey: { type: Sequelize.STRING(191), allowNull: false }, response: { type: Sequelize.JSON, allowNull: false }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      billing_webhook_events: {
        id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false }, eventId: { type: Sequelize.STRING(191), allowNull: false, unique: true }, eventType: { type: Sequelize.STRING(100), allowNull: false }, payload: { type: Sequelize.JSON, allowNull: false }, signature: { type: Sequelize.STRING(255), allowNull: false }, processingStatus: { type: Sequelize.ENUM("RECEIVED", "PROCESSED", "FAILED"), allowNull: false, defaultValue: "RECEIVED" }, processedAt: { type: Sequelize.DATE }, failureReason: { type: Sequelize.STRING(1000) }, retryCount: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      billing_usage_counters: {
        id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false }, organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" }, resource: { type: Sequelize.STRING(100), allowNull: false }, periodKey: { type: Sequelize.STRING(20), allowNull: false }, used: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      billing_audit_events: {
        id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false }, organizationId: { type: Sequelize.STRING(191), allowNull: false, references: { model: "organizations", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" }, actorUserId: { type: Sequelize.STRING(191) }, eventType: { type: Sequelize.STRING(100), allowNull: false }, resourceId: { type: Sequelize.STRING(191) }, metadata: { type: Sequelize.JSON }, createdAt: { type: Sequelize.DATE, allowNull: false },
      },
    };

    for (const [tableName, definition] of Object.entries(tableDefinitions)) {
      await ensureTable(queryInterface, tableName, definition);
      await ensureColumns(queryInterface, tableName, definition);
    }

    await ensureIndex(queryInterface, "subscriptions", ["organizationId", "status"], { name: "subscriptions_organization_status_idx" });
    await ensureIndex(queryInterface, "subscriptions", ["organizationId", "currentPeriodEnd"], { name: "subscriptions_organization_period_end_idx" });
    await ensureIndex(queryInterface, "billing_payments", ["organizationId", "createdAt"], { name: "billing_payments_organization_created_idx" });
    await ensureIndex(queryInterface, "billing_payments", ["subscriptionId", "createdAt"], { name: "billing_payments_subscription_created_idx" });
    await ensureIndex(queryInterface, "billing_idempotency_keys", ["organizationId", "operation", "idempotencyKey"], { unique: true, name: "billing_idempotency_unique" });
    await ensureIndex(queryInterface, "billing_webhook_events", ["eventType", "createdAt"], { name: "billing_webhook_event_type_created_idx" });
    await ensureIndex(queryInterface, "billing_webhook_events", ["processingStatus", "createdAt"], { name: "billing_webhook_status_created_idx" });
    await ensureIndex(queryInterface, "billing_usage_counters", ["organizationId", "resource", "periodKey"], { unique: true, name: "billing_usage_counter_unique" });
    await ensureIndex(queryInterface, "billing_audit_events", ["organizationId", "createdAt"], { name: "billing_audit_events_org_created_idx" });

    const now = new Date();
    const plans = [
      { id: randomUUID(), name: "Free", description: "Free plan", razorpayPlanId: "CONFIGURE_FREE_PLAN", billingInterval: "MONTHLY", price: 0, currency: "INR", features: ["KNOWLEDGE_BASE", "DOCUMENT_UPLOAD"], limits: { documents: 10, knowledge_bases: 1, team_members: 1, ai_queries_month: 20, storage_mb: 100 }, active: true, metadata: { system: true }, createdAt: now, updatedAt: now },
      { id: randomUUID(), name: "Pro", description: "Professional plan", razorpayPlanId: "CONFIGURE_PRO_MONTHLY_PLAN", billingInterval: "MONTHLY", price: 99900, currency: "INR", features: ["KNOWLEDGE_BASE", "ADVANCED_SEARCH", "AI_ASSISTANT", "DOCUMENT_UPLOAD", "ANALYTICS", "EXPORT", "TEAM_MEMBERS", "API_ACCESS"], limits: { documents: 1000, knowledge_bases: 20, team_members: 10, ai_queries_month: 1000, storage_mb: 10000 }, active: true, metadata: { system: true }, createdAt: now, updatedAt: now },
      { id: randomUUID(), name: "Enterprise", description: "Enterprise plan", razorpayPlanId: "CONFIGURE_ENTERPRISE_MONTHLY_PLAN", billingInterval: "MONTHLY", price: 499900, currency: "INR", features: ["KNOWLEDGE_BASE", "ADVANCED_SEARCH", "AI_ASSISTANT", "DOCUMENT_UPLOAD", "ANALYTICS", "EXPORT", "TEAM_MEMBERS", "API_ACCESS", "CUSTOM_BRANDING"], limits: { documents: null, knowledge_bases: null, team_members: null, ai_queries_month: null, storage_mb: null }, active: true, metadata: { system: true }, createdAt: now, updatedAt: now },
    ];
    for (const plan of plans) await insertPlanIfMissing(queryInterface, Sequelize, plan);
  },

  async down(queryInterface) {
    for (const tableName of BILLING_TABLES) {
      if (await tableExists(queryInterface, tableName)) await queryInterface.dropTable(tableName);
    }
  },
};
