"use strict";
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define("Student", {
    name: DataTypes.STRING,
    grade: DataTypes.STRING,
  });
  return Student;
};
