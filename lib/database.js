import { Sequelize } from "sequelize";

const globalForDatabase = globalThis;

const sequelize =
  globalForDatabase.sequelize ??
  new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: Number(
        process.env.DB_PORT || 3306,
      ),
      dialect: "mysql",
      logging: false,
    },
  );

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.sequelize =
    sequelize;
}

export default sequelize;