"use strict";

const { randomUUID } = require("crypto");
const { QueryTypes } = require("sequelize");

const PERMISSIONS = [
  ["KNOWLEDGE_BASE_READ", "View Knowledge Bases", "knowledge_base", "read"],
  ["KNOWLEDGE_BASE_CREATE", "Create Knowledge Bases", "knowledge_base", "create"],
  ["KNOWLEDGE_BASE_UPDATE", "Update Knowledge Bases", "knowledge_base", "update"],
  ["KNOWLEDGE_BASE_DELETE", "Delete Knowledge Bases", "knowledge_base", "delete"],
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const permissionKeys = PERMISSIONS.map(([key]) => key);

    const rows = await queryInterface.sequelize.query(
      "SELECT id, `key` AS permissionKey FROM permissions WHERE `key` IN (:keys)",
      {
        replacements: { keys: permissionKeys },
        type: QueryTypes.SELECT,
      },
    );

    const existingPermissions = new Set(
      rows.map((row) => row.permissionKey),
    );

    const missingPermissions = PERMISSIONS.filter(
      ([key]) => !existingPermissions.has(key),
    );

    if (missingPermissions.length) {
      await queryInterface.bulkInsert(
        "permissions",
        missingPermissions.map(
          ([key, name, resource, action]) => ({
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
    }

    const roles = await queryInterface.sequelize.query(
      "SELECT id, `key` AS roleKey FROM roles WHERE `key` IN (:keys) AND isSystemRole = 1",
      {
        replacements: {
          keys: ["OWNER", "ADMIN", "MANAGER", "MEMBER"],
        },
        type: QueryTypes.SELECT,
      },
    );

    const permissionRows = await queryInterface.sequelize.query(
      "SELECT id, `key` AS permissionKey FROM permissions WHERE `key` IN (:keys)",
      {
        replacements: { keys: permissionKeys },
        type: QueryTypes.SELECT,
      },
    );

    const permissionMap = new Map(
      permissionRows.map((row) => [
        row.permissionKey,
        row.id,
      ]),
    );

    for (const role of roles) {
      const rolePermissionKeys =
        role.roleKey === "MEMBER"
          ? ["KNOWLEDGE_BASE_READ"]
          : permissionKeys;

      for (const key of rolePermissionKeys) {
        const permissionId = permissionMap.get(key);

        if (!permissionId) {
          throw new Error(`Permission ${key} was not found.`);
        }

        const existingLink =
          await queryInterface.sequelize.query(
            "SELECT id FROM role_permissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1",
            {
              replacements: {
                roleId: role.id,
                permissionId,
              },
              type: QueryTypes.SELECT,
            },
          );

        if (!existingLink.length) {
          await queryInterface.bulkInsert(
            "role_permissions",
            [
              {
                id: randomUUID(),
                roleId: role.id,
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
    const permissionKeys = PERMISSIONS.map(
      ([key]) => key,
    );

    const rows = await queryInterface.sequelize.query(
      "SELECT id FROM permissions WHERE `key` IN (:keys)",
      {
        replacements: { keys: permissionKeys },
        type: QueryTypes.SELECT,
      },
    );

    if (rows.length) {
      await queryInterface.bulkDelete("role_permissions", {
        permissionId: rows.map((row) => row.id),
      });
    }

    await queryInterface.bulkDelete("permissions", {
      key: permissionKeys,
    });
  },
};
