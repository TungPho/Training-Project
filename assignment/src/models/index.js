const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

const Student = require("./student")(sequelize, DataTypes);
const Teacher = require("./teacher")(sequelize, DataTypes);
const Registration = require("./registration")(sequelize, DataTypes);

Teacher.belongsToMany(Student, { through: Registration });
Student.belongsToMany(Teacher, { through: Registration });

module.exports = { sequelize, Student, Teacher, Registration };
