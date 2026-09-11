"use strict";

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable("documents", {
        id: {
            type: Sequelize.STRING(191),
            allowNull: false,
            primaryKey: true,
        },

        name: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },

        fileType: {
            type: Sequelize.ENUM(
                "PDF",
                "DOCX"
            ),
            allowNull: false,
        },

        storageKey: {
            type: Sequelize.STRING(500),
            allowNull: false,
        },

        sizeBytes: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        },

        status: {
            type: Sequelize.ENUM(
                "PROCESSING",
                "PROCESSED",
                "FAILED"
            ),
            allowNull: false,
            defaultValue: "PROCESSING",
        },

        uploadedBy: {
            type: Sequelize.STRING(255),
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
    });

    await queryInterface.addIndex(
        "documents",
        ["status"]
    );

    await queryInterface.addIndex(
        "documents",
        ["createdAt"]
    );
}
export async function down(queryInterface) {
    await queryInterface.dropTable("documents");
}