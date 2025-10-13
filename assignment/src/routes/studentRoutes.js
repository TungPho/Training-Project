const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentController");

router.post("/", controller.createStudent);
router.get("/", controller.getAllStudents);

module.exports = router;
