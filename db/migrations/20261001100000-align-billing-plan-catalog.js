"use strict";

const { randomUUID } = require("crypto");

async function findPlan(queryInterface, Sequelize, name) {
  return (
    await queryInterface.sequelize.query(
      "SELECT * FROM billing_plans WHERE name = :name LIMIT 1",
      { replacements: { name }, type: Sequelize.QueryTypes.SELECT },
    )
  )[0];
}

async function updatePlan(queryInterface, Sequelize, name, values) {
  const existing = await findPlan(queryInterface, Sequelize, name);
  if (!existing) return null;

  await queryInterface.bulkUpdate("billing_plans", {
    ...values,
    features: JSON.stringify(values.features),
    limits: JSON.stringify(values.limits),
    metadata: JSON.stringify(values.metadata ?? { system: true }),
    updatedAt: new Date(),
  }, { id: existing.id });

  return existing.id;
}

async function createPlan(queryInterface, Sequelize, plan) {
  const existing = await findPlan(queryInterface, Sequelize, plan.name);
  if (existing) return existing.id;

  const row = {
    ...plan,
    id: plan.id ?? randomUUID(),
    features: JSON.stringify(plan.features),
    limits: JSON.stringify(plan.limits),
    metadata: JSON.stringify(plan.metadata ?? { system: true }),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await queryInterface.bulkInsert("billing_plans", [row]);
  return row.id;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const free = {
      name: "Free",
      description: "Free plan",
      razorpayPlanId: "CONFIGURE_FREE_PLAN",
      billingInterval: "MONTHLY",
      price: 0,
      currency: "INR",
      features: ["KNOWLEDGE_BASE", "DOCUMENT_UPLOAD"],
      limits: {
        documents: 10,
        knowledge_bases: 1,
        team_members: 1,
        ai_queries_month: 20,
        storage_mb: 100,
      },
      active: true,
      metadata: { system: true },
    };

    const starter = {
      name: "Starter",
      description: "For small teams getting started with centralized knowledge.",
      razorpayPlanId: "CONFIGURE_STARTER_MONTHLY_PLAN",
      billingInterval: "MONTHLY",
      price: 99900,
      currency: "INR",
      features: ["KNOWLEDGE_BASE", "DOCUMENT_UPLOAD", "AI_ASSISTANT"],
      limits: {
        documents: 1000,
        knowledge_bases: 5,
        team_members: 10,
        ai_queries_month: 1000,
        storage_mb: 25600,
      },
      active: true,
      metadata: { system: true, paymentPagePlan: "starter" },
    };

    const business = {
      name: "Business",
      description: "For growing organizations that need advanced controls and collaboration.",
      razorpayPlanId: "CONFIGURE_BUSINESS_MONTHLY_PLAN",
      billingInterval: "MONTHLY",
      price: 299900,
      currency: "INR",
      features: [
        "KNOWLEDGE_BASE",
        "ADVANCED_SEARCH",
        "AI_ASSISTANT",
        "DOCUMENT_UPLOAD",
        "ANALYTICS",
        "EXPORT",
        "TEAM_MEMBERS",
        "API_ACCESS",
      ],
      limits: {
        documents: 5000,
        knowledge_bases: 20,
        team_members: 50,
        ai_queries_month: 10000,
        storage_mb: 102400,
      },
      active: true,
      metadata: { system: true, paymentPagePlan: "business" },
    };

    const enterprise = {
      name: "Enterprise",
      description: "For organizations requiring maximum control, security and scale.",
      razorpayPlanId: "CONFIGURE_ENTERPRISE_MONTHLY_PLAN",
      billingInterval: "MONTHLY",
      price: 799900,
      currency: "INR",
      features: [
        "KNOWLEDGE_BASE",
        "ADVANCED_SEARCH",
        "AI_ASSISTANT",
        "DOCUMENT_UPLOAD",
        "ANALYTICS",
        "EXPORT",
        "TEAM_MEMBERS",
        "API_ACCESS",
        "CUSTOM_BRANDING",
      ],
      limits: {
        documents: null,
        knowledge_bases: 100,
        team_members: 250,
        ai_queries_month: 50000,
        storage_mb: 512000,
      },
      active: true,
      metadata: { system: true, paymentPagePlan: "enterprise" },
    };

    await updatePlan(queryInterface, Sequelize, "Free", free);

    let starterId = await findPlan(queryInterface, Sequelize, "Starter");
    if (!starterId) {
      const legacyPro = await findPlan(queryInterface, Sequelize, "Pro");
      if (legacyPro) {
        await queryInterface.bulkUpdate("billing_plans", {
          name: "Starter",
          description: starter.description,
          razorpayPlanId: legacyPro.razorpayPlanId || starter.razorpayPlanId,
          billingInterval: starter.billingInterval,
          price: starter.price,
          currency: starter.currency,
          features: JSON.stringify(starter.features),
          limits: JSON.stringify(starter.limits),
          active: true,
          metadata: JSON.stringify(starter.metadata),
          updatedAt: now,
        }, { id: legacyPro.id });
        starterId = legacyPro.id;
      } else {
        starterId = await createPlan(queryInterface, Sequelize, starter);
      }
    } else {
      await updatePlan(queryInterface, Sequelize, "Starter", starter);
      starterId = starterId.id;
    }

    await createPlan(queryInterface, Sequelize, business);
    await createPlan(queryInterface, Sequelize, enterprise);
    await updatePlan(queryInterface, Sequelize, "Enterprise", enterprise);

    const lingeringPro = await findPlan(queryInterface, Sequelize, "Pro");
    if (lingeringPro && lingeringPro.id !== starterId) {
      await queryInterface.bulkUpdate("billing_plans", { active: false, updatedAt: now }, { id: lingeringPro.id });
    }
  },

  async down() {
    // This migration is intentionally forward-only. Rolling it back could
    // invalidate subscriptions that were moved from legacy Pro to Starter.
  },
};
