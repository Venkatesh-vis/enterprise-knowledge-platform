"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    /*
     * ----------------------------------------------------
     * 1. Create audit_logs
     * ----------------------------------------------------
     */

    await queryInterface.createTable(
      "audit_logs",
      {
        id: {
          type: Sequelize.STRING(36),
          primaryKey: true,
          allowNull: false,
        },

        organizationId: {
          type: Sequelize.STRING(191),
          allowNull: false,
        },

        actorUserId: {
          type: Sequelize.STRING(191),
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

        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["organizationId", "createdAt"],
      {
        name:
          "audit_logs_organization_created_idx",
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["actorUserId", "createdAt"],
      {
        name:
          "audit_logs_actor_created_idx",
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["action", "createdAt"],
      {
        name:
          "audit_logs_action_created_idx",
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["resource", "resourceId"],
      {
        name:
          "audit_logs_resource_idx",
      },
    );

    await queryInterface.addIndex(
      "audit_logs",
      ["targetUserId", "createdAt"],
      {
        name:
          "audit_logs_target_user_created_idx",
      },
    );

    /*
     * ----------------------------------------------------
     * 2. Add Audit Log permission
     * ----------------------------------------------------
     */

    const permissions = [
      {
        key: "AUDIT_LOG_READ",
        name: "View Audit Logs",
        resource: "audit_log",
        action: "read",
      },

      {
        key: "INVITATION_READ",
        name: "View Invitations",
        resource: "invitation",
        action: "read",
      },

      {
        key: "INVITATION_CREATE",
        name: "Create Invitations",
        resource: "invitation",
        action: "create",
      },

      {
        key: "INVITATION_IMPORT",
        name: "Bulk Import Invitations",
        resource: "invitation",
        action: "import",
      },

      {
        key: "INVITATION_RESEND",
        name: "Resend Invitations",
        resource: "invitation",
        action: "resend",
      },

      {
        key: "INVITATION_REVOKE",
        name: "Revoke Invitations",
        resource: "invitation",
        action: "revoke",
      },
    ];

    const existingPermissionRows =
      await queryInterface.sequelize.query(
        `
          SELECT id, \`key\`
          FROM permissions
          WHERE \`key\` IN (:keys)
        `,
        {
          replacements: {
            keys: permissions.map(
              (permission) =>
                permission.key,
            ),
          },

          type:
            Sequelize.QueryTypes
              .SELECT,
        },
      );

    const existingPermissionKeys =
      new Set(
        existingPermissionRows.map(
          (permission) =>
            permission.key,
        ),
      );

    const now = new Date();

    const permissionsToInsert =
      permissions.filter(
        (permission) =>
          !existingPermissionKeys.has(
            permission.key,
          ),
      );

    if (
      permissionsToInsert.length >
      0
    ) {
      await queryInterface.bulkInsert(
        "permissions",
        permissionsToInsert.map(
          (permission) => ({
            id: randomUUID(),

            key: permission.key,

            name: permission.name,

            resource:
              permission.resource,

            action:
              permission.action,

            description: null,

            createdAt: now,

            updatedAt: now,
          }),
        ),
      );
    }

    /*
     * ----------------------------------------------------
     * 3. Resolve roles and permissions
     * ----------------------------------------------------
     */

    const roles =
      await queryInterface.sequelize.query(
        `
          SELECT id, \`key\`
          FROM roles
          WHERE \`key\` IN (
            'OWNER',
            'ADMIN',
            'MANAGER',
            'MEMBER'
          )
        `,
        {
          type:
            Sequelize.QueryTypes
              .SELECT,
        },
      );

    const roleMap =
      new Map(
        roles.map(
          (role) => [
            role.key,
            role.id,
          ],
        ),
      );

    const permissionRows =
      await queryInterface.sequelize.query(
        `
          SELECT id, \`key\`
          FROM permissions
          WHERE \`key\` IN (:keys)
        `,
        {
          replacements: {
            keys: permissions.map(
              (permission) =>
                permission.key,
            ),
          },

          type:
            Sequelize.QueryTypes
              .SELECT,
        },
      );

    const permissionMap =
      new Map(
        permissionRows.map(
          (permission) => [
            permission.key,
            permission.id,
          ],
        ),
      );

    /*
     * ----------------------------------------------------
     * 4. Permission assignment
     *
     * OWNER
     * ADMIN
     * MANAGER
     *   -> invitation permissions
     *
     * OWNER
     * ADMIN
     *   -> audit log read
     *
     * MEMBER
     *   -> none
     * ----------------------------------------------------
     */

    const rolePermissionKeys = {
      OWNER: [
        "AUDIT_LOG_READ",

        "INVITATION_READ",
        "INVITATION_CREATE",
        "INVITATION_IMPORT",
        "INVITATION_RESEND",
        "INVITATION_REVOKE",
      ],

      ADMIN: [
        "AUDIT_LOG_READ",

        "INVITATION_READ",
        "INVITATION_CREATE",
        "INVITATION_IMPORT",
        "INVITATION_RESEND",
        "INVITATION_REVOKE",
      ],

      MANAGER: [
        "INVITATION_READ",
        "INVITATION_CREATE",
        "INVITATION_IMPORT",
        "INVITATION_RESEND",
        "INVITATION_REVOKE",
      ],

      MEMBER: [],
    };

    for (const [
      roleKey,
      permissionKeys,
    ] of Object.entries(
      rolePermissionKeys,
    )) {
      const roleId =
        roleMap.get(roleKey);

      if (!roleId) {
        throw new Error(
          `Role "${roleKey}" was not found.`,
        );
      }

      for (const permissionKey of permissionKeys) {
        const permissionId =
          permissionMap.get(
            permissionKey,
          );

        if (!permissionId) {
          throw new Error(
            `Permission "${permissionKey}" was not found.`,
          );
        }

        const existingRows =
          await queryInterface.sequelize.query(
            `
              SELECT id
              FROM role_permissions
              WHERE roleId = :roleId
              AND permissionId = :permissionId
              LIMIT 1
            `,
            {
              replacements: {
                roleId,
                permissionId,
              },

              type:
                Sequelize
                  .QueryTypes
                  .SELECT,
            },
          );

        if (
          existingRows.length ===
          0
        ) {
          await queryInterface.bulkInsert(
            "role_permissions",
            [
              {
                id: randomUUID(),

                roleId,

                permissionId,

                createdAt: now,

                updatedAt: now,
              },
            ],
          );
        }
      }
    }
  },

  async down(queryInterface) {
    /*
     * Remove the new role-permission
     * records first.
     */

    const permissions =
      await queryInterface.sequelize.query(
        `
          SELECT id
          FROM permissions
          WHERE \`key\` IN (
            'AUDIT_LOG_READ',
            'INVITATION_READ',
            'INVITATION_CREATE',
            'INVITATION_IMPORT',
            'INVITATION_RESEND',
            'INVITATION_REVOKE'
          )
        `,
        {
          type:
            require("sequelize")
              .QueryTypes
              .SELECT,
        },
      );

    const permissionIds =
      permissions.map(
        (permission) =>
          permission.id,
      );

    if (
      permissionIds.length > 0
    ) {
      await queryInterface.bulkDelete(
        "role_permissions",
        {
          permissionId:
            permissionIds,
        },
      );
    }

    await queryInterface.bulkDelete(
      "permissions",
      {
        key: [
          "AUDIT_LOG_READ",
          "INVITATION_READ",
          "INVITATION_CREATE",
          "INVITATION_IMPORT",
          "INVITATION_RESEND",
          "INVITATION_REVOKE",
        ],
      },
    );

    await queryInterface.dropTable(
      "audit_logs",
    );
  },
};