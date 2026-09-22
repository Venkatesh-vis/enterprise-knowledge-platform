"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invitations", {
      id: {
        type: Sequelize.STRING(191),
        primaryKey: true,
        allowNull: false,
      },
      organizationId: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },
      invitedByUserId: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },
      roleId: {
        type: Sequelize.STRING(36),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tokenHash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      activeKey: {
        type: Sequelize.STRING(320),
        allowNull: true,
        unique: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastSentAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      sendCount: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      acceptedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("invitations", ["organizationId", "status", "createdAt"]);
    await queryInterface.addIndex("invitations", ["organizationId", "email"]);
    await queryInterface.addIndex("invitations", ["organizationId", "expiresAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("invitations");
  },
};
