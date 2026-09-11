"use strict";

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable(
        "organization_memberships",
        {
            id: {
                type: Sequelize.STRING(191),
                allowNull: false,
                primaryKey: true,
            },

            userId: {
                type: Sequelize.STRING(191),
                allowNull: false,

                references: {
                    model: "users",
                    key: "id",
                },

                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            organizationId: {
                type: Sequelize.STRING(191),
                allowNull: false,

                references: {
                    model: "organizations",
                    key: "id",
                },

                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            role: {
                type: Sequelize.ENUM(
                    "OWNER",
                    "ADMIN",
                    "MEMBER"
                ),
                allowNull: false,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        },
        {
            uniqueKeys: {
                user_organization_unique: {
                    fields: ["userId", "organizationId"],
                },
            },
        }
    );
}
export async function down(queryInterface) {
    await queryInterface.dropTable(
        "organization_memberships"
    );
}