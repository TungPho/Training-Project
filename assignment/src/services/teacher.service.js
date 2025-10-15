const Database = require("../dbs/db.connect");
const db = Database.getInstance();
const { Student, Teacher, Registration } = db;
const { Op } = require("sequelize");

class TeacherBusinessService {
  static getAllStudents = async () => {
    const students = await Student.findAll({
      attributes: ["email", "suspended"],
    });
    return students.map((s) => ({
      email: s.email,
      suspended: s.suspended,
    }));
  };
  static getAllTeachers = async () => {
    const teachers = await Teacher.findAll({
      attributes: ["email"],
    });
    return teachers.map((t) => ({
      email: t.email,
    }));
  };
  static getAllRegistrations = async () => {
    const registrations = await Registration.findAll({});
    return registrations;
  };

  // API 1:
  static registerStudentForTeacher = async (teacher, students) => {
    const [teacherObj] = await Teacher.findOrCreate({
      where: { email: teacher },
    });
    for (const studentEmail of students) {
      const [studentObj] = await Student.findOrCreate({
        where: { email: studentEmail },
      });
      await teacherObj.addStudent(studentObj);
    }
    return { message: "Register Successfully!" };
  };

  static getCommonStudents = async (emails) => {
    const teachers = await Teacher.findAll({
      where: { email: emails },
      include: "Students",
    });
    const studentLists = teachers.map((t) => t.Students.map((s) => s.email));
    const common = studentLists.reduce((a, b) =>
      a.filter((c) => b.includes(c))
    );
    return common;
  };
  // 3. Suspense student
  static suspenseStudent = async (studentObj) => {
    studentObj.suspended = true;
    await studentObj.save();
    return true;
  };
  static getStudentsWhichRecievesNotifications = async (
    teacher,
    notification
  ) => {
    // 1. Lấy danh sách học sinh đăng ký với giáo viên (chưa suspend)
    const teacherObj = await Teacher.findOne({
      where: { email: teacher },
      include: {
        model: Student,
        where: { suspended: false },
        attributes: ["email"],
      },
    });

    let registeredStudents = [];
    if (teacherObj && teacherObj.Students) {
      registeredStudents = teacherObj.Students.map((student) => student.email);
    }

    // 2. Lấy danh sách học sinh được mention trong notification (chưa suspend)
    // Regex tìm các email bắt đầu bằng @
    const mentionPattern = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const mentionedEmails = [];
    let match;
    while ((match = mentionPattern.exec(notification)) !== null) {
      mentionedEmails.push(match[1]);
    }

    let mentionedStudents = [];
    if (mentionedEmails.length > 0) {
      const studentsMentioned = await Student.findAll({
        where: {
          email: { [Op.in]: mentionedEmails },
          suspended: false,
        },
        attributes: ["email"],
      });
      mentionedStudents = studentsMentioned.map((student) => student.email);
    }

    // 3. Gộp danh sách, loại trùng
    const finalRecipients = Array.from(
      new Set([...registeredStudents, ...mentionedStudents])
    );
    return finalRecipients;
  };
}
module.exports = TeacherBusinessService;
