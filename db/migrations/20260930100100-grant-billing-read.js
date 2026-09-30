"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    const [permission] = await queryInterface.sequelize.query(
      "SELECT id FROM permissions WHERE `key` = 'BILLING_READ' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (!permission) throw new Error("BILLING_READ permission was not found.");

    const roles = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE `key` IN ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER')",
      { type: Sequelize.QueryTypes.SELECT },
    );
    const now = new Date();
    for (const role of roles) {
      const [existing] = await queryInterface.sequelize.query(
        "SELECT id FROM role_permissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1",
        { replacements: { roleId: role.id, permissionId: permission.id }, type: Sequelize.QueryTypes.SELECT },
      );
      if (!existing) await queryInterface.bulkInsert("role_permissions", [{ id: randomUUID(), roleId: role.id, permissionId: permission.id, createdAt: now, updatedAt: now }]);
    }
  },

  async down(queryInterface, Sequelize) {
    const [permission] = await queryInterface.sequelize.query(
      "SELECT id FROM permissions WHERE `key` = 'BILLING_READ' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (permission) await queryInterface.bulkDelete("role_permissions", { permissionId: permission.id });
  },
};
