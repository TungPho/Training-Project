// teacher.controller.test.js

// Mock toàn bộ các hàm của Service
jest.mock("../src/services/teacher.service", () => ({
  getAllStudents: jest.fn(),
  getAllTeachers: jest.fn(),
  getAllRegistrations: jest.fn(),
  registerStudentForTeacher: jest.fn(),
  getCommonStudents: jest.fn(),
  suspenseStudent: jest.fn(),
  getStudentsWhichRecievesNotifications: jest.fn(),
}));

// Mock Database và Student model
const mockFindOne = jest.fn();
jest.mock("../src/dbs/db.connect", () => ({
  getInstance: jest.fn(() => ({
    Student: { findOne: mockFindOne },
    Teacher: {},
    Registration: {},
  })),
}));

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

const teacherBusinessController = require("../src/controllers/teacher.controller");
const TeacherBusinessService = require("../src/services/teacher.service");

// Bắt đầu viết test cho từng hàm
describe("TeacherBusinessController - Integration Test", () => {
  // getAllStudents
  describe("getAllStudents", () => {
    it("should return 200 and students list", async () => {
      const students = [{ email: "a@mail.com" }, { email: "b@mail.com" }];
      TeacherBusinessService.getAllStudents.mockResolvedValue(students);

      const req = {};
      const res = createMockRes();

      await teacherBusinessController.getAllStudents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ students });
    });

    it("should return 500 on error", async () => {
      TeacherBusinessService.getAllStudents.mockRejectedValue(
        new Error("fail")
      );

      const req = {};
      const res = createMockRes();

      await teacherBusinessController.getAllStudents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  // getAllTeachers
  describe("getAllTeachers", () => {
    it("should return 200 and teachers list", async () => {
      const teachers = [{ email: "t1@mail.com" }, { email: "t2@mail.com" }];
      TeacherBusinessService.getAllTeachers.mockResolvedValue(teachers);

      const req = {};
      const res = createMockRes();

      await teacherBusinessController.getAllTeachers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ teachers });
    });

    it("should return 500 on error", async () => {
      TeacherBusinessService.getAllTeachers.mockRejectedValue(
        new Error("fail")
      );

      const req = {};
      const res = createMockRes();

      await teacherBusinessController.getAllTeachers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  // getAllRegistrations
  describe("getAllRegistrations", () => {
    it("should return 200 and registrations", async () => {
      const registrations = [{ id: 1 }, { id: 2 }];
      TeacherBusinessService.getAllRegistrations.mockResolvedValue(
        registrations
      );

      const req = {};
      const res = createMockRes();

      await teacherBusinessController.getAllRegistraions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ registrations });
    });

    it("should return 500 on error", async () => {
      TeacherBusinessService.getAllRegistrations.mockRejectedValue(
        new Error("fail")
      );

      const req = {};
      const res = createMockRes();

      await teacherBusinessController.getAllRegistraions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  // registerStudentForTeacher
  describe("registerStudentForTeacher", () => {
    it("should return 201 and success message", async () => {
      TeacherBusinessService.registerStudentForTeacher.mockResolvedValue(
        "Register Successfully!"
      );

      const req = { body: { teacher: "t@mail.com", students: ["a@mail.com"] } };
      const res = createMockRes();

      await teacherBusinessController.registerStudentForTeacher(req, res);

      expect(
        TeacherBusinessService.registerStudentForTeacher
      ).toHaveBeenCalledWith("t@mail.com", ["a@mail.com"]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Register Successfully!",
      });
    });

    it("should return 400 if payload invalid", async () => {
      const req = { body: { teacher: "", students: "not_array" } };
      const res = createMockRes();

      await teacherBusinessController.registerStudentForTeacher(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid payload" });
    });

    it("should return 500 on error", async () => {
      TeacherBusinessService.registerStudentForTeacher.mockRejectedValue(
        new Error("fail")
      );

      const req = { body: { teacher: "t@mail.com", students: ["a@mail.com"] } };
      const res = createMockRes();

      await teacherBusinessController.registerStudentForTeacher(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });

  // getCommonStudents
  describe("getCommonStudents", () => {
    it("should return 200 and common students list", async () => {
      TeacherBusinessService.getCommonStudents.mockResolvedValue([
        "a@mail.com",
        "b@mail.com",
      ]);

      const req = { query: { teacher: "ta@mail.com,tb@mail.com" } };
      const res = createMockRes();

      await teacherBusinessController.getCommonStudents(req, res);

      expect(TeacherBusinessService.getCommonStudents).toHaveBeenCalledWith([
        "ta@mail.com",
        "tb@mail.com",
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        students: ["a@mail.com", "b@mail.com"],
      });
    });

    it("should return 400 if missing teacher emails", async () => {
      const req = { query: {} };
      const res = createMockRes();

      await teacherBusinessController.getCommonStudents(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing teacher emails",
      });
    });
  });

  // suspendStudent
  describe("suspendStudent", () => {
    beforeEach(() => {
      mockFindOne.mockReset();
    });

    it("should return 204 and success when suspend ok", async () => {
      const studentObj = { email: "a@mail.com" };
      mockFindOne.mockResolvedValue(studentObj);
      TeacherBusinessService.suspenseStudent.mockResolvedValue(true);

      const req = { body: { student: "a@mail.com" } };
      const res = createMockRes();

      await teacherBusinessController.suspendStudent(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: "a@mail.com" },
      });
      expect(TeacherBusinessService.suspenseStudent).toHaveBeenCalledWith(
        studentObj
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        message: "Suspend Student Successfully!",
      });
    });

    it("should return 400 if no student email", async () => {
      const req = { body: {} };
      const res = createMockRes();

      await teacherBusinessController.suspendStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No student email provided",
      });
    });

    it("should return 404 if student not found", async () => {
      mockFindOne.mockResolvedValue(null);

      const req = { body: { student: "notfound@mail.com" } };
      const res = createMockRes();

      await teacherBusinessController.suspendStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Student not found" });
    });

    it("should return 404 if cannot suspend", async () => {
      const studentObj = { email: "a@mail.com" };
      mockFindOne.mockResolvedValue(studentObj);
      TeacherBusinessService.suspenseStudent.mockResolvedValue(false);

      const req = { body: { student: "a@mail.com" } };
      const res = createMockRes();

      await teacherBusinessController.suspendStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Some Error Ocurred" });
    });
  });

  // getStudentListThatRecieveNotifications
  describe("getStudentListThatRecieveNotifications", () => {
    it("should return 200 and recipients", async () => {
      TeacherBusinessService.getStudentsWhichRecievesNotifications.mockResolvedValue(
        ["a@mail.com"]
      );

      const req = { body: { teacher: "t@mail.com", notification: "hello" } };
      const res = createMockRes();

      await teacherBusinessController.getStudentListThatRecieveNotifications(
        req,
        res
      );

      expect(
        TeacherBusinessService.getStudentsWhichRecievesNotifications
      ).toHaveBeenCalledWith("t@mail.com", "hello");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ recipients: ["a@mail.com"] });
    });

    it("should return 400 if missing teacher or notification", async () => {
      const req = { body: { teacher: "" } };
      const res = createMockRes();

      await teacherBusinessController.getStudentListThatRecieveNotifications(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing teacher or notification",
      });
    });
  });
});
