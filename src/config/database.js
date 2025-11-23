import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = process.env.MYSQL_URL
  ? new Sequelize(process.env.MYSQL_URL, {
      dialect: "mysql",
      timezone: process.env.TIMEZONE || "America/Managua",
      logging: false,
    })
  : new Sequelize(
      process.env.MYSQLDATABASE,
      process.env.MYSQLUSER,
      process.env.MYSQLPASSWORD || "",
      {
        host: process.env.MYSQLHOST,
        dialect: "mysql",
        port: process.env.MYSQLPORT || 3306,
        timezone: process.env.TIMEZONE || "America/Managua",
        logging: false,
      }
    );

export default sequelize;
