const express = require("express");
const router = express.Router();
const teacherBuisinessController = require("../controllers/teacher.controller");

// GET all students
router.get("/students", teacherBuisinessController.getAllStudents);

router.get("/teachers", teacherBuisinessController.getAllTeachers);

router.get("/registraions", teacherBuisinessController.getAllRegistraions);

// 1. Register students to teacher
router.post("/register", teacherBuisinessController.registerStudentForTeacher);

// 2. Get common students
router.get("/commonstudents", teacherBuisinessController.getCommonStudents);

// 3. Suspend student
router.post("/suspend", teacherBuisinessController.suspendStudent);

// 4. Retrieve notification recipients
router.post(
  "/retrievefornotifications",
  teacherBuisinessController.getStudentListThatRecieveNotifications
);

module.exports = router;
