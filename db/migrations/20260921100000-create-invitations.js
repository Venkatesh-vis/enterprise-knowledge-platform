"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "invitations",
      {
        id: {
          type: Sequelize.STRING(191),
          allowNull: false,
          primaryKey: true,
        },

        organizationId: {
          type: Sequelize.STRING(191),
          allowNull: false,
          references: {
            model: "organizations",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },

        invitedByUserId: {
          type: Sequelize.STRING(191),
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },

        roleId: {
          type: Sequelize.STRING(36),
          allowNull: false,
          references: {
            model: "roles",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },

        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },

        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },

        /*
         * SHA-256(token)
         */
        tokenHash: {
          type: Sequelize.STRING(64),
          allowNull: false,
        },

        /*
         * organizationId + normalized email hash
         *
         * NULL when invitation is no longer active.
         */
        activeKey: {
          type: Sequelize.STRING(64),
          allowNull: true,
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
      },
    );

    await queryInterface.addIndex(
      "invitations",
      ["tokenHash"],
      {
        unique: true,
        name: "invitations_token_hash_unique",
      },
    );

    await queryInterface.addIndex(
      "invitations",
      ["activeKey"],
      {
        unique: true,
        name: "invitations_active_key_unique",
      },
    );

    await queryInterface.addIndex(
      "invitations",
      [
        "organizationId",
        "status",
        "createdAt",
      ],
      {
        name: "invitations_org_status_created_idx",
      },
    );

    await queryInterface.addIndex(
      "invitations",
      [
        "organizationId",
        "email",
      ],
      {
        name: "invitations_org_email_idx",
      },
    );

    await queryInterface.addIndex(
      "invitations",
      [
        "organizationId",
        "expiresAt",
      ],
      {
        name: "invitations_org_expires_idx",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "invitations",
    );
  },
};