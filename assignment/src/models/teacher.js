module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define("Teacher", {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
  });
  return Teacher;
};
