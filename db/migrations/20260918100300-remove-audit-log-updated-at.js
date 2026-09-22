export async function up(queryInterface) {
  await queryInterface.removeColumn("audit_logs", "updatedAt");
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.addColumn("audit_logs", "updatedAt", {
    type: Sequelize.DATE,
    allowNull: false,
  });
}