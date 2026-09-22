import { DataTypes } from "sequelize";

import sequelize from "../../lib/database";

const Invitation = sequelize.define(
  "Invitation",
  {
    id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      allowNull: false,
    },

    organizationId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    invitedByUserId: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    roleId: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },

    /*
     * Non-null only while an invitation is active.
     * This lets MySQL enforce one active invitation
     * per organization + email.
     */
    activeKey: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDING",
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    sendCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },

    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "invitations",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["tokenHash"],
      },

      {
        unique: true,
        fields: ["activeKey"],
      },

      {
        fields: [
          "organizationId",
          "status",
          "createdAt",
        ],
      },

      {
        fields: [
          "organizationId",
          "email",
        ],
      },

      {
        fields: [
          "organizationId",
          "expiresAt",
        ],
      },
    ],
  },
);

export default Invitation;