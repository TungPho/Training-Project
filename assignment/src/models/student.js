module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define("Student", {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
  return Student;
};
