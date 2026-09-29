"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("documents", "organizationId", {
      type: Sequelize.STRING(191), allowNull: true,
      references: { model: "organizations", key: "id" },
      onUpdate: "CASCADE", onDelete: "CASCADE",
    });

    await queryInterface.addColumn("documents", "uploadedByUserId", {
      type: Sequelize.STRING(191), allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE", onDelete: "SET NULL",
    });

    await queryInterface.addIndex("documents", ["organizationId", "createdAt"], {
      name: "documents_organization_created_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("documents", "documents_organization_created_idx");
    await queryInterface.removeColumn("documents", "uploadedByUserId");
    await queryInterface.removeColumn("documents", "organizationId");
  },
};
