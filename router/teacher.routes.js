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
router.get("/teacher/all", async (req, res) => {
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
    const updateData = {};

    console.log("O‘qituvchi ID:", id);
    console.log("Tushgan ma'lumotlar:", req.body);

    // Teacherni topamiz
    const teacher = await teacherModel.findById(id);
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "O'qituvchi topilmadi",
      });
    }

    console.log("Joriy o‘qituvchi:", teacher);

    // Parolni o'zgartirishni taqiqlaymiz
    if (req.body.password) {
      return res.status(400).json({
        status: "error",
        message: "Parolni o'zgartirish mumkin emas",
      });
    }

    // Rasm yuklangan bo'lsa, saqlaymiz
    if (req.files && req.files.profileImage) {
      const imageFile = req.files.profileImage;
      const uploadDir = "public/images";

      console.log("Yangi rasm yuklanmoqda...");

      // Agar papka mavjud bo'lmasa, yaratamiz
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Fayl nomi: teacherId_vaqt.png yoki .jpg
      const fileExt = path.extname(imageFile.name);
      const fileName = `${id}_${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      // Faylni saqlaymiz
      await imageFile.mv(filePath);

      // Eski rasmni o‘chiramiz, agar u default rasm bo‘lmasa
      if (teacher.profileImage && teacher.profileImage.startsWith("images/")) {
        const oldImagePath = path.join("public", teacher.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Yangi rasmni saqlaymiz
      updateData.profileImage = `http://localhost:7474/public/images/${fileName}`;

      console.log("Yangi rasm saqlandi:", updateData.profileImage);
    }

    // Foydalanuvchi faqat kerakli maydonlarni o‘zgartirishi mumkin
    ["firstName", "lastName", "phone"].forEach((field) => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    console.log("Yangilanishi kerak bo‘lgan maydonlar:", updateData);

    // Agar hech narsa o'zgarmagan bo'lsa, serverga so'rov yuborishning hojati yo'q
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "O'zgarish yo'q, yangilash uchun ma'lumot yuboring",
      });
    }

    // Ma'lumotlarni yangilaymiz
    const updatedTeacher = await teacherModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    console.log("Yangilangan teacher:", updatedTeacher);

    res.status(200).json({
      status: "success",
      message: "O'qituvchi muvaffaqiyatli yangilandi",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Xatolik:", error);
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
