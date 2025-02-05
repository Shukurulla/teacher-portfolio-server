import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import teacherModel from "../models/teachers.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/teacher/create", async (req, res) => {
  try {
    const { firstName, lastName, phone, password } = req.body;
    const findTeacher = await teacherModel.findOne({ phone: phone });
    if (findTeacher) {
      return res.status(400).json({
        status: "error",
        message: "Bu telefon raqam oldin royhatdan otgan",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacherSchema = {
      firstName,
      lastName,
      phone,
      password: hashedPassword,
    };
    const teacher = await teacherModel.create(teacherSchema);
    if (!teacher) {
      return res.status(400).json({
        status: "error",
        message: "Teacher yaratishda xatolik yuz berdi",
      });
    }
    const token = jwt.sign({ userId: teacher._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.status(200).json({
      token,
      teacher,
      status: "success",
      message: "Teacher muaffaqiyatli yaratildi",
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.post("/teacher/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const findTeacher = await teacherModel.findOne({ phone: phone });
    if (!findTeacher) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday teacher topilmadi" });
    }
    const comparePassword = await bcrypt.compare(
      password,
      findTeacher.password
    );
    if (!comparePassword) {
      return res
        .status(400)
        .json({ status: "error", message: "Password mos kelmadi" });
    }
    const token = jwt.sign(
      { userId: findTeacher._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.status(200).json({
      token,
      data: findTeacher,
      status: "success",
      message: "Profilga muaffaqiyatli kirildi",
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/teacher/profile", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const findTeacher = await teacherModel.findById(userId);
    if (!findTeacher) {
      return res.json({ status: "error", message: "Bunday Teacher topilmadi" });
    }
    res.status(200).json({ status: "success", data: findTeacher });
  } catch (error) {
    res
      .status(error.message || 500)
      .json({ message: error.message, status: "error" });
  }
});
router.get("/teacher/all", authMiddleware, async (req, res) => {
  try {
    const teachers = await teacherModel.find();
    res.status(200).json({ status: "success", data: teachers });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/teacher/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const findTeacher = await teacherModel.findById(id);
    if (!findTeacher) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday teacher topilmadi" });
    }
    res.status(200).json({ status: "success", data: findTeacher });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.put("/teacher/edit/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.password) {
      return res.status(400).json({
        status: "error",
        message: "Bu bolimda passwordni ozgartirish mumkin emas",
      });
    }
    const findTeacher = await teacherModel.findById(id);
    if (!findTeacher) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday teacher topilmadi" });
    }

    const editedTeacher = await teacherModel.findByIdAndUpdate(
      id,
      { $set: req.body }, // Yangilash uchun $set operatoridan foydalaning
      { new: true } // Yangilangan hujjatni qaytarish uchun
    );

    if (!editedTeacher) {
      return res.status(400).json({
        status: "error",
        message: "Teacher malumotlarini ozgartirishda hatolik ketdi",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Teacher muaffaqiyatli ozgartirildi",
      data: editedTeacher,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});
router.delete("/teacher/delete/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const findTeacher = await teacherModel.findById(id);
    if (!findTeacher) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday teacher topilmadi" });
    }

    await teacherModel.findByIdAndDelete(id);
    const teachers = await teacherModel.find();
    res.status(200).json({
      status: "success",
      message: "Teacher muaffaqiyatli ochirildi",
      data: teachers,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

export default router;
