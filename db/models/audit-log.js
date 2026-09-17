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
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    indexes: [
      {
        fields: [
          "organizationId",
          "createdAt",
        ],
      },
      {
        fields: [
          "actorUserId",
          "createdAt",
        ],
      },
      {
        fields: [
          "action",
          "createdAt",
        ],
      },
      {
        fields: [
          "resource",
          "resourceId",
        ],
      },
      {
        fields: [
          "targetUserId",
          "createdAt",
        ],
      },
    ],
  },
);

export default AuditLog;