import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const KnowledgeBase = sequelize.define(
  "KnowledgeBase",
  {
    id: { type: DataTypes.STRING(36), primaryKey: true, allowNull: false },
    organizationId: { type: DataTypes.STRING(191), allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.STRING(500), allowNull: true },
    createdByUserId: { type: DataTypes.STRING(191), allowNull: false },
  },
  {
    tableName: "knowledge_bases",
    timestamps: true,
    indexes: [{ unique: true, fields: ["organizationId", "slug"] }],
  },
);

export default KnowledgeBase;
