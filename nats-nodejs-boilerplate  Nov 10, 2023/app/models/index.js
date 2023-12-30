import dbConfig from "../config/db.config.js";
import Sequelize from "sequelize";

import subject from "./subject.model.js";
import student from "./student.model.js";
import mark from "./mark.model.js";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.subject = subject(sequelize, Sequelize);
db.student = student(sequelize, Sequelize);
db.mark = mark(sequelize, Sequelize);

export default db;
