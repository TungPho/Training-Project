const express = require("express");
const router = express.Router();

router.use("/teachers", require("./teacherRoutes"));
router.use("/students", require("./studentRoutes"));

module.exports = router;
