export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("audit_logs", "actorName", {
    type: Sequelize.STRING(100),
    allowNull: false,
  });

  await queryInterface.addColumn("audit_logs", "actorEmail", {
    type: Sequelize.STRING(255),
    allowNull: false,
  });

  await queryInterface.addColumn("audit_logs", "targetUserName", {
    type: Sequelize.STRING(100),
    allowNull: true,
  });

  await queryInterface.addColumn("audit_logs", "targetUserEmail", {
    type: Sequelize.STRING(255),
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("audit_logs", "targetUserEmail");
  await queryInterface.removeColumn("audit_logs", "targetUserName");
  await queryInterface.removeColumn("audit_logs", "actorEmail");
  await queryInterface.removeColumn("audit_logs", "actorName");
}