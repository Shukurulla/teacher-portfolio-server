import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import teacherModel from "../models/teachers.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
import fs from "fs";
import path from "path";
import jobModel from "../models/job.model.js";
import fileModel from "../models/files.model.js";
import { provinces } from "../constants/index.js";

const router = express.Router();

router.get("/teacher/regions", async (req, res) => {
  try {
    res.json({ data: provinces, status: "success" });
  } catch (error) {
    res.json({ message: error.message, status: "error" });
  }
});

router.get("/teacher/sorted-regions", authMiddleware, async (req, res) => {
  try {
    const teachers = await teacherModel.find();
    const regions = ["Toshkent", "Nukus", "Samarqand", "Fargʻona"];
    const sortedTeacher = regions.map((item) => {
      return {
        region: item,
        teachers: teachers.filter((c) => c.region.region == item),
      };
    });
    res.json(sortedTeacher);
  } catch (error) {
    res.json(error);
  }
});

router.post("/teacher/create", async (req, res) => {
  try {
    const { firstName, lastName, phone, password, province } = req.body;

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
      region: province,
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

// router.get("/teacher/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const findTeacher = await teacherModel.findById(id);
//     if (!findTeacher) {
//       return res
//         .status(400)
//         .json({ status: "error", message: "Bunday teacher topilmadi" });
//     }
//     res.status(200).json({ status: "success", data: findTeacher });
//   } catch (error) {
//     res
//       .status(error.status || 500)
//       .json({ status: "error", message: error.message });
//   }
// });

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
      updateData.profileImage = `https://server.portfolio-sport.uz/public/images/${fileName}`;

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

router.get("/teachers", async (req, res) => {
  try {
    // 1. O'qituvchilarni olish (parolni chiqarish yo‘q)
    const teachers = await teacherModel.find({}, "-password").lean();

    // 2. Barcha ish joylarini olish
    const jobs = await jobModel.find().lean();

    // 3. Barcha yutuqlarni olish
    const achievements = await fileModel.find().lean();

    // 4. Har bir o'qituvchini jobs va achievements bilan bog'lash
    const result = teachers.map((teacher) => {
      // Ish joylarini ajratish
      const teacherJobs = jobs.filter(
        (job) => job.teacher.toString() === teacher._id.toString()
      );

      // Yutuqlarni ajratish
      const teacherAchievements = achievements.filter(
        (ach) => ach.from.id.toString() === teacher._id.toString()
      );

      return {
        ...teacher,
        jobs: teacherJobs,
        jobsCount: teacherJobs.length,
        achievementsCount: teacherAchievements.length,
        totalPoints: teacherAchievements.reduce(
          (sum, ach) => sum + (ach.achievments.rating?.rating || 0),
          0
        ),
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/teacher/:id", async (req, res) => {
  try {
    const teacher = await teacherModel
      .findById(req.params.id)
      .select("-password");
    if (!teacher)
      return res.status(404).json({ message: "O'qituvchi topilmadi" });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/teacher/:teacherId/jobs", async (req, res) => {
  try {
    const jobs = await jobModel.find({ teacher: req.params.teacherId });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/teacher/:teacherId/achievements", async (req, res) => {
  try {
    const achievements = await fileModel.find({
      "from.id": req.params.teacherId,
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
