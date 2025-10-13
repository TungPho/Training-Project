const { Student, Teacher } = require("../models");

exports.createStudent = async (req, res) => {
  const student = await Student.create(req.body);
  res.json(student);
};

exports.getAllStudents = async (req, res) => {
  const students = await Student.findAll({ include: Teacher });
  res.json(students);
};
