import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import teacherModel from "../models/teachers.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";

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

    // Parolni o'zgartirishni taqiqlash
    if (req.body.password) {
      return res.status(400).json({
        status: "error",
        message: "Bu bo‘limda parolni o‘zgartirish mumkin emas",
      });
    }

    const findTeacher = await teacherModel.findById(id);
    if (!findTeacher) {
      return res.status(400).json({
        status: "error",
        message: "Bunday teacher topilmadi",
      });
    }

    let profileImage = findTeacher.profileImage; // Eski rasmni saqlab qolamiz

    // Agar rasm yuklangan bo'lsa, uni saqlash
    if (req.files && req.files.profileImage) {
      const imageFile = req.files.profileImage;
      const uploadPath = "public/images";

      // Agar papka mavjud bo'lmasa, yaratamiz
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Fayl nomini yaratish
      const fileName = `${Date.now()}_${imageFile.name}`;
      const filePath = path.join(uploadPath, fileName);

      // Faylni saqlash
      await imageFile.mv(filePath);

      // Eski rasmni o‘chirish (agar mavjud bo‘lsa)
      if (
        findTeacher.profileImage &&
        fs.existsSync(path.join("public", findTeacher.profileImage))
      ) {
        fs.unlinkSync(path.join("public", findTeacher.profileImage));
      }

      // Yangi rasm nomini saqlaymiz
      profileImage = `images/${fileName}`;
    }

    // Ma'lumotlarni yangilash
    const editedTeacher = await teacherModel.findByIdAndUpdate(
      id,
      { $set: { ...req.body, profileImage } },
      { new: true }
    );

    if (!editedTeacher) {
      return res.status(400).json({
        status: "error",
        message: "Teacher ma'lumotlarini o‘zgartirishda xatolik yuz berdi",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Teacher muvaffaqiyatli o‘zgartirildi",
      data: editedTeacher,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
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
