const { Teacher, Student } = require("../models");

exports.createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  const teachers = await Teacher.findAll({ include: Student });
  res.json(teachers);
};
