import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const Document =
  sequelize.define(
    "Document",
    {
      id: {
        type: DataTypes.STRING(191),
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      fileType: {
        type: DataTypes.ENUM(
          "PDF",
          "DOCX",
        ),
        allowNull: false,
      },

      storageKey: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },

      sizeBytes: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
          "PROCESSING",
          "PROCESSED",
          "FAILED",
        ),
        allowNull: false,
        defaultValue: "PROCESSING",
      },

      uploadedBy: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "documents",
      timestamps: true,
      indexes: [
        {
          fields: ["status"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    },
  );

export default Document;