"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "permissions",
      {
        id: {
          type: Sequelize.STRING(36),
          primaryKey: true,
          allowNull: false,
        },

        key: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },

        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },

        resource: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },

        action: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },

        description: {
          type: Sequelize.STRING(255),
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

    await queryInterface.createTable(
      "roles",
      {
        id: {
          type: Sequelize.STRING(36),
          primaryKey: true,
          allowNull: false,
        },

        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },

        key: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },

        description: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },

        organizationId: {
          type: Sequelize.STRING(36),
          allowNull: true,

          references: {
            model: "organizations",
            key: "id",
          },

          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },

        isSystemRole: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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

    await queryInterface.createTable(
      "role_permissions",
      {
        id: {
          type: Sequelize.STRING(36),
          primaryKey: true,
          allowNull: false,
        },

        roleId: {
          type: Sequelize.STRING(36),
          allowNull: false,

          references: {
            model: "roles",
            key: "id",
          },

          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },

        permissionId: {
          type: Sequelize.STRING(36),
          allowNull: false,

          references: {
            model: "permissions",
            key: "id",
          },

          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
      "role_permissions",
      ["roleId", "permissionId"],
      {
        unique: true,
        name:
          "role_permissions_role_permission_unique",
      },
    );

    const now = new Date();

    const permissions = [
      ["DASHBOARD_VIEW", "Dashboard View", "dashboard", "view"],

      ["DOCUMENT_READ", "Read Documents", "document", "read"],
      ["DOCUMENT_CREATE", "Create Documents", "document", "create"],
      ["DOCUMENT_UPDATE", "Update Documents", "document", "update"],
      ["DOCUMENT_DELETE", "Delete Documents", "document", "delete"],

      ["USER_READ", "View Users", "user", "read"],
      ["USER_INVITE", "Invite Users", "user", "invite"],
      ["USER_UPDATE", "Update Users", "user", "update"],
      ["USER_DELETE", "Delete Users", "user", "delete"],

      ["AI_USE", "Use AI Assistant", "ai", "use"],

      ["ANALYTICS_READ", "View Analytics", "analytics", "read"],

      ["BILLING_READ", "View Billing", "billing", "read"],
      ["BILLING_MANAGE", "Manage Billing", "billing", "manage"],

      ["SECURITY_READ", "View Security", "security", "read"],
      ["SECURITY_MANAGE", "Manage Security", "security", "manage"],

      ["ORGANIZATION_SETTINGS_READ", "View Organization Settings", "organization", "read",],
      ["ORGANIZATION_SETTINGS_UPDATE", "Update Organization Settings", "organization", "update",],
    ];

    await queryInterface.bulkInsert(
      "permissions",
      permissions.map(
        ([
          key,
          name,
          resource,
          action,
        ]) => ({
          id: randomUUID(),
          key,
          name,
          resource,
          action,
          description: null,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );

    const roles = [
      {
        id: randomUUID(),
        name: "Owner",
        key: "OWNER",
        description:
          "Full organization access.",
        organizationId: null,
        isSystemRole: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Administrator",
        key: "ADMIN",
        description:
          "Administrative organization access.",
        organizationId: null,
        isSystemRole: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Manager",
        key: "MANAGER",
        description:
          "Operational management access.",
        organizationId: null,
        isSystemRole: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "Member",
        key: "MEMBER",
        description:
          "Standard workspace access.",
        organizationId: null,
        isSystemRole: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert(
      "roles",
      roles,
    );

    const permissionRows =
      await queryInterface.sequelize.query(
        "SELECT id, `key` FROM permissions",
        {
          type: Sequelize.QueryTypes.SELECT,
        },
      );

    const permissionMap =
      new Map(
        permissionRows.map(
          (row) => [
            row.key,
            row.id,
          ],
        ),
      );

    const rolePermissions = {
      OWNER: permissions.map(
        ([key]) => key,
      ),

      ADMIN: permissions
        .filter(
          ([key]) =>
            key !== "BILLING_MANAGE",
        )
        .map(
          ([key]) => key,
        ),

      MANAGER: [
        "DASHBOARD_VIEW",
        "DOCUMENT_READ",
        "DOCUMENT_CREATE",
        "DOCUMENT_UPDATE",
        "DOCUMENT_DELETE",
        "USER_READ",
        "USER_INVITE",
        "AI_USE",
        "ANALYTICS_READ",
        "ORGANIZATION_SETTINGS_READ",
      ],

      MEMBER: [
        "DASHBOARD_VIEW",
        "DOCUMENT_READ",
        "AI_USE",
      ],
    };

    const rolePermissionRows = [];

    for (const role of roles) {
      const keys =
        rolePermissions[role.key];

      for (const key of keys) {
        rolePermissionRows.push({
          id: randomUUID(),
          roleId: role.id,
          permissionId:
            permissionMap.get(key),
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert(
      "role_permissions",
      rolePermissionRows,
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "role_permissions",
    );

    await queryInterface.dropTable(
      "roles",
    );

    await queryInterface.dropTable(
      "permissions",
    );
  },
};