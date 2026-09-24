"use strict";

const { randomUUID } = require("crypto");

const PERMISSIONS = [
  ["KNOWLEDGE_BASE_READ", "View Knowledge Bases", "knowledge_base", "read"],
  ["KNOWLEDGE_BASE_CREATE", "Create Knowledge Bases", "knowledge_base", "create"],
  ["KNOWLEDGE_BASE_UPDATE", "Update Knowledge Bases", "knowledge_base", "update"],
  ["KNOWLEDGE_BASE_DELETE", "Delete Knowledge Bases", "knowledge_base", "delete"],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const rows = await queryInterface.sequelize.query(
      "SELECT id, key FROM permissions WHERE key IN (:keys)",
      { replacements: { keys: PERMISSIONS.map(([key]) => key) }, type: Sequelize.QueryTypes.SELECT },
    );
    const existing = new Set(rows.map((row) => row.key));

    const missing = PERMISSIONS.filter(([key]) => !existing.has(key));
    if (missing.length) {
      await queryInterface.bulkInsert(
        "permissions",
        missing.map(([key, name, resource, action]) => ({
          id: randomUUID(), key, name, resource, action,
          description: null, createdAt: now, updatedAt: now,
        })),
      );
    }

    const roles = await queryInterface.sequelize.query(
      "SELECT id, key FROM roles WHERE key IN (:keys) AND isSystemRole = 1",
      { replacements: { keys: ["OWNER", "ADMIN", "MANAGER", "MEMBER"] }, type: Sequelize.QueryTypes.SELECT },
    );

    const permissionRows = await queryInterface.sequelize.query(
      "SELECT id, key FROM permissions WHERE key IN (:keys)",
      { replacements: { keys: PERMISSIONS.map(([key]) => key) }, type: Sequelize.QueryTypes.SELECT },
    );
    const permissionMap = new Map(permissionRows.map((row) => [row.key, row.id]));

    for (const role of roles) {
      const keys = role.key === "MEMBER"
        ? ["KNOWLEDGE_BASE_READ"]
        : PERMISSIONS.map(([key]) => key);

      for (const key of keys) {
        const permissionId = permissionMap.get(key);
        const existingLink = await queryInterface.sequelize.query(
          "SELECT id FROM role_permissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1",
          { replacements: { roleId: role.id, permissionId }, type: Sequelize.QueryTypes.SELECT },
        );
        if (!existingLink.length) {
          await queryInterface.bulkInsert("role_permissions", [{
            id: randomUUID(), roleId: role.id, permissionId,
            createdAt: now, updatedAt: now,
          }]);
        }
      }
    }
  },

  async down(queryInterface) {
    const keys = PERMISSIONS.map(([key]) => key);
    const rows = await queryInterface.sequelize.query(
      "SELECT id FROM permissions WHERE key IN (:keys)",
      { replacements: { keys }, type: require("sequelize").QueryTypes.SELECT },
    );
    if (rows.length) {
      await queryInterface.bulkDelete("role_permissions", {
        permissionId: rows.map((row) => row.id),
      });
    }
    await queryInterface.bulkDelete("permissions", { key: keys });
  },
};
