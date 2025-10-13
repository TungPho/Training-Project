"use strict";
const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config.js").development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  { host: config.host, dialect: config.dialect }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Teacher = require("./teacher")(sequelize, DataTypes);
db.Student = require("./student")(sequelize, DataTypes);

// Many-to-Many
db.Teacher.belongsToMany(db.Student, { through: "TeacherStudents" });
db.Student.belongsToMany(db.Teacher, { through: "TeacherStudents" });

module.exports = db;
