const express = require("express");
const router = express.Router();
const controller = require("../controllers/teacherController");

router.post("/", controller.createTeacher);
router.get("/", controller.getAllTeachers);

module.exports = router;
