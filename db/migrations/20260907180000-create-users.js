"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.STRING(191),
      allowNull: false,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },

    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },

    passwordHash: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },

    emailVerified: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    image: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable("users");
}