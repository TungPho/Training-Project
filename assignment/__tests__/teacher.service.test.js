jest.mock("../src/dbs/db.connect", () => {
  // create mock functions placeholders; chúng ta có thể override implementation trong từng test
  const Student = {
    findAll: jest.fn(),
    findOrCreate: jest.fn(),
  };
  const Teacher = {
    findAll: jest.fn(),
    findOrCreate: jest.fn(),
    findOne: jest.fn(),
  };
  const Registration = {
    findAll: jest.fn(),
  };

  return {
    getInstance: () => ({ Student, Teacher, Registration }),
  };
});

const dbModule = require("../src/dbs/db.connect");
const db = dbModule.getInstance();
const TeacherBusinessService = require("../src/services/teacher.service");
const { Op } = require("sequelize"); // optional, không cần mock

describe("TeacherBusinessService - Unit tests", () => {
  beforeEach(() => {
    // reset tất cả mock trước mỗi test
    jest.clearAllMocks();
  });

  describe("getAllStudents", () => {
    it("should return array of { email, suspended }", async () => {
      const mockStudents = [
        { email: "a@mail.com", suspended: false },
        { email: "b@mail.com", suspended: true },
      ];
      db.Student.findAll.mockResolvedValue(mockStudents);

      const result = await TeacherBusinessService.getAllStudents();

      expect(db.Student.findAll).toHaveBeenCalledWith({
        attributes: ["email", "suspended"],
      });
      expect(result).toEqual([
        { email: "a@mail.com", suspended: false },
        { email: "b@mail.com", suspended: true },
      ]);
    });
  });

  describe("getAllTeachers", () => {
    it("should return array of { email }", async () => {
      const mockTeachers = [{ email: "t1@mail.com" }, { email: "t2@mail.com" }];
      db.Teacher.findAll.mockResolvedValue(mockTeachers);

      const result = await TeacherBusinessService.getAllTeachers();

      expect(db.Teacher.findAll).toHaveBeenCalledWith({
        attributes: ["email"],
      });
      expect(result).toEqual([
        { email: "t1@mail.com" },
        { email: "t2@mail.com" },
      ]);
    });
  });

  describe("getAllRegistrations", () => {
    it("should return registrations as-is", async () => {
      const mockRegs = [{ id: 1 }, { id: 2 }];
      db.Registration.findAll.mockResolvedValue(mockRegs);

      const result = await TeacherBusinessService.getAllRegistrations();

      expect(db.Registration.findAll).toHaveBeenCalled();
      expect(result).toBe(mockRegs);
    });
  });

  describe("registerStudentForTeacher", () => {
    it("should create/find teacher and students and addStudent for each student", async () => {
      const mockTeacherObj = {
        addStudent: jest.fn(),
      };
      // findOrCreate for Teacher returns [teacherObj, created?], service expects [teacherObj]
      db.Teacher.findOrCreate.mockResolvedValue([mockTeacherObj]);
      db.Student.findOrCreate.mockResolvedValue([{ email: "stu@mail.com" }]);

      const result = await TeacherBusinessService.registerStudentForTeacher(
        "t@mail.com",
        ["stu@mail.com"]
      );

      expect(db.Teacher.findOrCreate).toHaveBeenCalledWith({
        where: { email: "t@mail.com" },
      });
      expect(db.Student.findOrCreate).toHaveBeenCalledWith({
        where: { email: "stu@mail.com" },
      });
      expect(mockTeacherObj.addStudent).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: "Register Successfully!" });
    });

    it("should handle multiple students (call addStudent for each)", async () => {
      const mockTeacherObj = { addStudent: jest.fn() };
      db.Teacher.findOrCreate.mockResolvedValue([mockTeacherObj]);
      // make student.findOrCreate return different student each call
      db.Student.findOrCreate
        .mockResolvedValueOnce([{ email: "a@mail.com" }])
        .mockResolvedValueOnce([{ email: "b@mail.com" }]);

      const result = await TeacherBusinessService.registerStudentForTeacher(
        "t2@mail.com",
        ["a@mail.com", "b@mail.com"]
      );

      expect(db.Student.findOrCreate).toHaveBeenCalledTimes(2);
      expect(mockTeacherObj.addStudent).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: "Register Successfully!" });
    });
  });

  describe("getCommonStudents", () => {
    it("should return intersection of students' emails across teachers", async () => {
      const teacherA = {
        Students: [{ email: "a@mail.com" }, { email: "b@mail.com" }],
      };
      const teacherB = {
        Students: [{ email: "b@mail.com" }, { email: "c@mail.com" }],
      };
      db.Teacher.findAll.mockResolvedValue([teacherA, teacherB]);

      const result = await TeacherBusinessService.getCommonStudents([
        "ta@mail.com",
        "tb@mail.com",
      ]);

      expect(db.Teacher.findAll).toHaveBeenCalledWith({
        where: { email: ["ta@mail.com", "tb@mail.com"] },
        include: "Students",
      });
      expect(result).toEqual(["b@mail.com"]);
    });

    it("should handle single teacher case (return all that teacher has)", async () => {
      const teacherA = { Students: [{ email: "x@mail.com" }] };
      db.Teacher.findAll.mockResolvedValue([teacherA]);

      const result = await TeacherBusinessService.getCommonStudents([
        "ta@mail.com",
      ]);
      expect(result).toEqual(["x@mail.com"]);
    });
  });

  describe("suspenseStudent", () => {
    it("should set suspended true and save", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const studentObj = { suspended: false, save: saveMock };

      const res = await TeacherBusinessService.suspenseStudent(studentObj);

      expect(studentObj.suspended).toBe(true);
      expect(saveMock).toHaveBeenCalled();
      expect(res).toBe(true);
    });
  });

  describe("getStudentsWhichRecievesNotifications", () => {
    it("should return registered students when teacher has registered students and no mentions", async () => {
      const teacherObj = {
        Students: [{ email: "r1@mail.com" }, { email: "r2@mail.com" }],
      };
      db.Teacher.findOne.mockResolvedValue(teacherObj);
      // Student.findAll should not be called because no mention emails
      db.Student.findAll.mockResolvedValue([]);

      const result =
        await TeacherBusinessService.getStudentsWhichRecievesNotifications(
          "t@mail.com",
          "Hello students"
        );

      expect(db.Teacher.findOne).toHaveBeenCalled();
      expect(result.sort()).toEqual(["r1@mail.com", "r2@mail.com"].sort());
    });

    it("should return mentioned students when teacher has none", async () => {
      db.Teacher.findOne.mockResolvedValue(null);
      // simulate Student.findAll returning mentioned students
      db.Student.findAll.mockResolvedValue([
        { email: "m1@mail.com" },
        { email: "m2@mail.com" },
      ]);

      const result =
        await TeacherBusinessService.getStudentsWhichRecievesNotifications(
          "missing@mail.com",
          "Hi @m1@mail.com and @m2@mail.com"
        );

      expect(db.Student.findAll).toHaveBeenCalled();
      expect(result.sort()).toEqual(["m1@mail.com", "m2@mail.com"].sort());
    });

    it("should combine registered and mentioned students and remove duplicates", async () => {
      const teacherObj = {
        Students: [{ email: "r1@mail.com" }, { email: "m1@mail.com" }],
      };
      db.Teacher.findOne.mockResolvedValue(teacherObj);
      db.Student.findAll.mockResolvedValue([
        { email: "m1@mail.com" },
        { email: "m2@mail.com" },
      ]);

      const result =
        await TeacherBusinessService.getStudentsWhichRecievesNotifications(
          "t@mail.com",
          "Notice to @m1@mail.com and @m2@mail.com"
        );

      // final recipients should be unique
      expect(result.sort()).toEqual(
        ["r1@mail.com", "m1@mail.com", "m2@mail.com"].sort()
      );
    });

    it("should ignore suspended mentioned students because query filters suspended:false (mock ensures only non-suspended returned)", async () => {
      // even if notification mentions suspended email, Student.findAll mock should return only non-suspended ones
      db.Teacher.findOne.mockResolvedValue(null);
      db.Student.findAll.mockResolvedValue([{ email: "active@mail.com" }]);

      const result =
        await TeacherBusinessService.getStudentsWhichRecievesNotifications(
          "t@mail.com",
          "Hello @suspended@mail.com and @active@mail.com"
        );

      expect(result).toEqual(["active@mail.com"]);
    });
  });
});
