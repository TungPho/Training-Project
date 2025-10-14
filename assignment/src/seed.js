require("dotenv").config();
const { sequelize, Teacher, Student } = require("./models");

async function seed() {
  await sequelize.sync({ force: true }); // Xóa hết DB và tạo lại (nên dùng khi dev, nếu prod thì bỏ force)

  // Seed Teachers
  await Teacher.bulkCreate([
    { email: "teacherken@gmail.com" },
    { email: "teacherjoe@gmail.com" },
  ]);

  // Seed Students
  await Student.bulkCreate([
    { email: "studentjon@gmail.com" },
    { email: "studenthon@gmail.com" },
    { email: "studentmary@gmail.com" },
    { email: "studentagnes@gmail.com" },
    { email: "studentmiche@gmail.com" },
    { email: "studentbob@gmail.com" },
  ]);

  console.log("Seeding done!");
  process.exit();
}

seed();
