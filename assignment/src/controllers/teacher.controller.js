const TeacherBusinessService = require("../services/teacher.service");
const Database = require("../dbs/db.connect");
const db = Database.getInstance();
const { Student, Teacher, Registration } = db;
class TeacherBusinessController {
  // get teachers and students
  getAllStudents = async (req, res) => {
    try {
      const students = await TeacherBusinessService.getAllStudents();
      res.status(200).json({
        students,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getAllTeachers = async (req, res) => {
    try {
      const teachers = await TeacherBusinessService.getAllTeachers();
      res.status(200).json({
        teachers,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getAllRegistraions = async (req, res) => {
    try {
      const registrations = await TeacherBusinessService.getAllRegistrations();
      res.status(200).json({
        registrations,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  // 1. User Story 1: Register Student
  registerStudentForTeacher = async (req, res) => {
    try {
      const { teacher, students } = req.body;
      if (!teacher || !Array.isArray(students))
        return res.status(400).json({ error: "Invalid payload" });
      return res.status(201).json({
        message: await TeacherBusinessService.registerStudentForTeacher(
          teacher,
          students
        ),
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  };
  // 2. User Story 2:
  getCommonStudents = async (req, res) => {
    const teacherEmails = req.query.teacher;
    const emails = Array.isArray(teacherEmails)
      ? teacherEmails
      : teacherEmails?.split(",");
    if (!emails || emails.length === 0)
      return res.status(400).json({ error: "Missing teacher emails" });
    const commonStudents = await TeacherBusinessService.getCommonStudents(
      emails
    );
    return res.status(200).json({ students: commonStudents });
  };
  // User Story 3:
  suspendStudent = async (req, res) => {
    const { student } = req.body;
    if (!student)
      return res.status(400).json({ error: "No student email provided" });
    const studentObj = await Student.findOne({ where: { email: student } });
    if (!studentObj)
      return res.status(404).json({ error: "Student not found" });
    const suspended = await TeacherBusinessService.suspenseStudent(studentObj);
    if (!suspended)
      return res.status(404).json({ error: "Some Error Ocurred" });

    return res.status(204).json({
      message: "Suspend Student Successfully!",
    });
  };
  // User Story 4
  getStudentListThatRecieveNotifications = async (req, res) => {
    const { teacher, notification } = req.body;
    if (!teacher || !notification) {
      return res.status(400).json({ error: "Missing teacher or notification" });
    }
    const finalRecipients =
      await TeacherBusinessService.getStudentsWhichRecievesNotifications(
        teacher,
        notification
      );
    return res.status(200).json({ recipients: finalRecipients });
  };
}
const teacherBuisinessController = new TeacherBusinessController();
module.exports = teacherBuisinessController;
