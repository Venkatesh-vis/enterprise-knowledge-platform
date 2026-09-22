module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_logs", {
      id: {
        type: Sequelize.STRING(36),
        allowNull: false,
        primaryKey: true,
      },

      organizationId: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },

      actorUserId: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },

      actorName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      actorEmail: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      resource: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      resourceId: {
        type: Sequelize.STRING(191),
        allowNull: true,
      },

      targetUserId: {
        type: Sequelize.STRING(191),
        allowNull: true,
      },

      targetUserName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      targetUserEmail: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },

      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      "audit_logs",
      ["organizationId", "createdAt"],
      {
        name: "audit_logs_org_created_at_idx",
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["organizationId", "action", "createdAt"],
      {
        name: "audit_logs_org_action_created_at_idx",
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["organizationId", "resource", "createdAt"],
      {
        name: "audit_logs_org_resource_created_at_idx",
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["organizationId", "actorUserId", "createdAt"],
      {
        name: "audit_logs_org_actor_created_at_idx",
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["organizationId", "targetUserId", "createdAt"],
      {
        name: "audit_logs_org_target_created_at_idx",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "audit_logs",
      "audit_logs_org_target_created_at_idx",
    );

    await queryInterface.removeIndex(
      "audit_logs",
      "audit_logs_org_actor_created_at_idx",
    );

    await queryInterface.removeIndex(
      "audit_logs",
      "audit_logs_org_resource_created_at_idx",
    );

    await queryInterface.removeIndex(
      "audit_logs",
      "audit_logs_org_action_created_at_idx",
    );

    await queryInterface.removeIndex(
      "audit_logs",
      "audit_logs_org_created_at_idx",
    );

    await queryInterface.dropTable("audit_logs");
  },
};