"use strict";

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable("organizations", {
        id: {
            type: Sequelize.STRING(191),
            allowNull: false,
            primaryKey: true,
        },

        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },

        slug: {
            type: Sequelize.STRING(150),
            allowNull: false,
            unique: true,
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
    await queryInterface.dropTable("organizations");
}