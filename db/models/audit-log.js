import { DataTypes } from "sequelize";
import sequelize from "../../lib/database";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },

    organizationId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    actorUserId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    actorName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    actorEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    resourceId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    targetUserId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },

    targetUserName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    targetUserEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },

    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "audit_logs",
    timestamps: false,

    indexes: [
      {
        fields: [
          "organizationId",
          "createdAt",
        ],
      },
      {
        fields: [
          "organizationId",
          "action",
          "createdAt",
        ],
      },
      {
        fields: [
          "organizationId",
          "resource",
          "createdAt",
        ],
      },
      {
        fields: [
          "organizationId",
          "actorUserId",
          "createdAt",
        ],
      },
      {
        fields: [
          "organizationId",
          "targetUserId",
          "createdAt",
        ],
      },
    ],
  },
);

export default AuditLog;