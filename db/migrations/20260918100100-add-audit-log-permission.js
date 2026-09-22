import { randomUUID } from "crypto";

const AUDIT_PERMISSION_ID =
  "cf5f8c7c-5ceb-4619-a4e5-58e1c28ca44a"

export async function up(queryInterface, Sequelize) {
  const [existingPermissionRows] = await queryInterface.sequelize.query(
    `SELECT id FROM permissions WHERE \`key\` = :key LIMIT 1`,
    {
      replacements: {
        key: "AUDIT_LOG_READ",
      },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  if (existingPermissionRows?.id &&
    existingPermissionRows.id !==
    AUDIT_PERMISSION_ID) {
    throw new Error(
      "AUDIT_LOG_READ already exists with a different ID. Reconcile the existing permission before running this migration."
    );
  }

  if (!existingPermissionRows?.id) {
    await queryInterface.bulkInsert(
      "permissions",
      [
        {
          id: AUDIT_PERMISSION_ID,
          key: "AUDIT_LOG_READ",
          name: "View audit history",
          resource: "AUDIT_LOG",
          action: "READ",
          description: "View organization audit history and administrative activity.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
    );
  }

  const [permissionRows] = await queryInterface.sequelize.query(
    `SELECT id FROM permissions WHERE \`key\` = :key LIMIT 1`,
    {
      replacements: {
        key: "AUDIT_LOG_READ",
      },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  const permissionId = permissionRows?.id;

  if (!permissionId) {
    throw new Error(
      "AUDIT_LOG_READ permission could not be resolved."
    );
  }

  const roleRows = await queryInterface.sequelize.query(
    `SELECT id, \`key\` FROM roles WHERE \`key\` IN (:roleKeys) AND isSystemRole = 1`,
    {
      replacements: {
        roleKeys: [
          "OWNER",
          "ADMIN",
        ],
      },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  const roles = Array.isArray(
    roleRows
  )
    ? roleRows
    : [];

  const now = new Date();

  for (const role of roles) {
    const [existingLink] = await queryInterface.sequelize.query(
      `SELECT id FROM role_permissions WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1`,
      {
        replacements: {
          roleId: role.id,
          permissionId,
        },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (existingLink?.id) {
      continue;
    }

    await queryInterface.bulkInsert(
      "role_permissions",
      [
        {
          id: randomUUID(),
          roleId: role.id,
          permissionId,
          createdAt: now,
          updatedAt: now,
        },
      ]
    );
  }
}
export async function down(queryInterface, Sequelize) {
  const [permissionRows] = await queryInterface.sequelize.query(
    `SELECT id FROM permissions WHERE \`key\` = :key LIMIT 1`,
    {
      replacements: {
        key: "AUDIT_LOG_READ",
      },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  const permissionId = permissionRows?.id;

  if (!permissionId) {
    return;
  }

  if (permissionId !==
    AUDIT_PERMISSION_ID) {
    return;
  }

  await queryInterface.bulkDelete(
    "role_permissions",
    {
      permissionId,
    }
  );

  await queryInterface.bulkDelete(
    "permissions",
    {
      id: permissionId,
    }
  );
}