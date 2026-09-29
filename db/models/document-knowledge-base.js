import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const DocumentKnowledgeBase = sequelize.define(
  "DocumentKnowledgeBase",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true, allowNull: false },
    documentId: { type: DataTypes.STRING(191), allowNull: false },
    knowledgeBaseId: { type: DataTypes.STRING(36), allowNull: false },
  },
  {
    tableName: "document_knowledge_bases",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["documentId", "knowledgeBaseId"] },
      { fields: ["knowledgeBaseId"] },
    ],
  },
);

export default DocumentKnowledgeBase;
