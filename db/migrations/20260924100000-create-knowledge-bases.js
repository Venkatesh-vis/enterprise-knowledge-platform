"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("knowledge_bases", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      organizationId: {
        type: Sequelize.STRING(191), allowNull: false,
        references: { model: "organizations", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      slug: { type: Sequelize.STRING(180), allowNull: false },
      description: { type: Sequelize.STRING(500), allowNull: true },
      createdByUserId: {
        type: Sequelize.STRING(191), allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE", onDelete: "RESTRICT",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("knowledge_bases", ["organizationId", "slug"], {
      unique: true,
      name: "knowledge_bases_organization_slug_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("knowledge_bases");
  },
};
