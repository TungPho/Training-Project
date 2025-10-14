const express = require("express");
const router = express.Router();
const { Student, Teacher } = require("../models");

// 1. Register students to teacher
router.post("/register", async (req, res) => {
  const { teacher, students } = req.body;
  if (!teacher || !Array.isArray(students))
    return res.status(400).json({ error: "Invalid payload" });
  const [teacherObj] = await Teacher.findOrCreate({
    where: { email: teacher },
  });
  for (const studentEmail of students) {
    const [studentObj] = await Student.findOrCreate({
      where: { email: studentEmail },
    });
    await teacherObj.addStudent(studentObj);
  }
  res.status(204).end();
});

// 2. Get common students
router.get("/commonstudents", async (req, res) => {
  const teacherEmails = req.query.teacher;
  const emails = Array.isArray(teacherEmails)
    ? teacherEmails
    : teacherEmails?.split(",");
  if (!emails || emails.length === 0)
    return res.status(400).json({ error: "Missing teacher emails" });
  const teachers = await Teacher.findAll({
    where: { email: emails },
    include: "Students",
  });
  const studentLists = teachers.map((t) => t.Students.map((s) => s.email));
  const common = studentLists.reduce((a, b) => a.filter((c) => b.includes(c)));
  res.status(200).json({ students: common });
});

// 3. Suspend student
router.post("/suspend", async (req, res) => {
  const { student } = req.body;
  if (!student)
    return res.status(400).json({ error: "No student email provided" });
  const studentObj = await Student.findOne({ where: { email: student } });
  if (!studentObj) return res.status(404).json({ error: "Student not found" });
  studentObj.suspended = true;
  await studentObj.save();
  res.status(204).end();
});

// 4. Retrieve notification recipients
router.post("/retrievefornotifications", async (req, res) => {
  const { teacher, notification } = req.body;
  if (!teacher || !notification) {
    return res.status(400).json({ error: "Missing teacher or notification" });
  }
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

  return res.status(200).json({ recipients: finalRecipients });
});

// GET all students
router.get("/students", async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: ["email", "suspended"],
    });
    res.status(200).json({
      students: students.map((s) => ({
        email: s.email,
        suspended: s.suspended,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
