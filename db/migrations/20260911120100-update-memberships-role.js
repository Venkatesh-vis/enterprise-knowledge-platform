"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "organization_memberships",
      "roleId",
      {
        type: Sequelize.STRING(36),
        allowNull: true,

        references: {
          model: "roles",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
    );

    const memberships =
      await queryInterface.sequelize.query(
        `
          SELECT id, role
          FROM organization_memberships
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
        },
      );

    for (const membership of memberships) {
      const role =
        await queryInterface.sequelize.query(
          `
            SELECT id
            FROM roles
            WHERE \`key\` = :role
            LIMIT 1
          `,
          {
            replacements: {
              role: membership.role,
            },
            type: Sequelize.QueryTypes.SELECT,
          },
        );

      if (role.length === 0) {
        throw new Error(
          `Unable to map role "${membership.role}" for membership ${membership.id}.`,
        );
      }

      await queryInterface.sequelize.query(
        `
          UPDATE organization_memberships
          SET roleId = :roleId
          WHERE id = :id
        `,
        {
          replacements: {
            roleId: role[0].id,
            id: membership.id,
          },
        },
      );
    }

    await queryInterface.changeColumn(
      "organization_memberships",
      "roleId",
      {
        type: Sequelize.STRING(36),
        allowNull: false,

        references: {
          model: "roles",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
    );

    await queryInterface.removeColumn(
      "organization_memberships",
      "role",
    );

    await queryInterface.addIndex(
      "organization_memberships",
      ["roleId"],
      {
        name:
          "organization_memberships_role_id_idx",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "organization_memberships",
      "role",
      {
        type: Sequelize.ENUM(
          "OWNER",
          "ADMIN",
          "MANAGER",
          "MEMBER",
        ),
        allowNull: false,
        defaultValue: "MEMBER",
      },
    );

    await queryInterface.sequelize.query(
      `
        UPDATE organization_memberships om
        JOIN roles r ON r.id = om.roleId
        SET om.role = r.key
      `,
    );

    await queryInterface.removeIndex(
      "organization_memberships",
      "organization_memberships_role_id_idx",
    );

    await queryInterface.removeColumn(
      "organization_memberships",
      "roleId",
    );
  },
};