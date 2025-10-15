const { Sequelize, DataTypes } = require("sequelize");

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: "mysql",
      }
    );

    // Khởi tạo models
    this.Student = require("../models/student")(this.sequelize, DataTypes);
    this.Teacher = require("../models/teacher")(this.sequelize, DataTypes);
    this.Registration = require("../models/registration")(
      this.sequelize,
      DataTypes
    );

    // Thiết lập quan hệ
    this.Teacher.belongsToMany(this.Student, { through: this.Registration });
    this.Student.belongsToMany(this.Teacher, { through: this.Registration });

    // Lưu instance duy nhất
    Database.instance = this;
  }

  // Phương thức static để lấy instance duy nhất
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

module.exports = Database;
