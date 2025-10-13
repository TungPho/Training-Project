"use strict";
module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define("Teacher", {
    name: DataTypes.STRING,
    subject: DataTypes.STRING,
  });
  return Teacher;
};
