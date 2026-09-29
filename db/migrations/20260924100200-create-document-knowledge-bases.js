"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("document_knowledge_bases", {
      id: { type: Sequelize.STRING(36), primaryKey: true, allowNull: false },
      documentId: {
        type: Sequelize.STRING(191), allowNull: false,
        references: { model: "documents", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE",
      },
      knowledgeBaseId: {
        type: Sequelize.STRING(36), allowNull: false,
        references: { model: "knowledge_bases", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("document_knowledge_bases", ["documentId", "knowledgeBaseId"], {
      unique: true,
      name: "document_knowledge_bases_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("document_knowledge_bases");
  },
};
