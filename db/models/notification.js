import { DataTypes } from "sequelize";

import sequelize from "../../lib/database";

const Notification =
  sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
      },

      userId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },

      organizationId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM(
          "ROLE_CHANGED",
          "REMOVED_FROM_ORGANIZATION",
        ),
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      message: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },

      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName:
        "notifications",
      timestamps: true,
      indexes: [
        {
          fields: [
            "userId",
            "createdAt",
          ],
        },
        {
          fields: [
            "organizationId",
          ],
        },
      ],
    },
  );

export default Notification;