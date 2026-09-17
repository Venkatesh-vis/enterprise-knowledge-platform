"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "notifications",
      {
        id: {
          type: Sequelize.STRING(36),
          primaryKey: true,
          allowNull: false,
        },

        userId: {
          type: Sequelize.STRING(36),
          allowNull: false,
        },

        organizationId: {
          type: Sequelize.STRING(36),
          allowNull: false,
        },

        type: {
          type: Sequelize.ENUM(
            "ROLE_CHANGED",
            "REMOVED_FROM_ORGANIZATION",
          ),
          allowNull: false,
        },

        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },

        message: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },

        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
        },

        readAt: {
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
      },
    );

    await queryInterface.addIndex(
      "notifications",
      ["userId", "createdAt"],
    );

    await queryInterface.addIndex(
      "notifications",
      ["organizationId"],
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "notifications",
    );
  },
};