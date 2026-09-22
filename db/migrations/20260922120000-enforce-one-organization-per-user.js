"use strict";

module.exports = {
  async up(queryInterface) {
    const [duplicates] = await queryInterface.sequelize.query(`
      SELECT userId, COUNT(*) AS count
      FROM organization_memberships
      GROUP BY userId
      HAVING COUNT(*) > 1
    `);

    if (duplicates.length) {
      const sample = duplicates.slice(0, 10).map((row) => `${row.userId} (${row.count})`).join(", ");
      throw new Error(`Cannot enforce one organization per user. Duplicate memberships exist: ${sample}`);
    }

    await queryInterface.addIndex("organization_memberships", ["userId"], {
      unique: true,
      name: "organization_memberships_user_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("organization_memberships", "organization_memberships_user_unique");
  },
};
