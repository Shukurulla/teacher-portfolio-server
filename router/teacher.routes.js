import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import teacherModel from "../models/teachers.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import fs from "fs";
import path from "path";
import jobModel from "../models/job.model.js";
import fileModel from "../models/files.model.js";
import { provinces, DISTRICTS } from "../constants/index.js";
import malakaOshirishModel from "../models/malakaOshirish.model.js";
import specialAchievementModel from "../models/specialAchievement.model.js";

const router = express.Router();

const getApprovedPoints = (achievements) =>
  achievements.reduce((sum, ach) => {
    if (ach.status !== "Tasdiqlandi") return sum;
    return (
      sum + (ach.files?.reduce((s, f) => s + (f.rating?.rating || 0), 0) || 0)
    );
  }, 0);

const getNextMalaka = (plans) => {
  const sorted = [...plans].sort((a, b) => new Date(a.date) - new Date(b.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sorted.find((plan) => new Date(plan.date) >= today) || sorted[0] || null;
};

const withTeacherStats = (teacher, jobs, achievements, specials, malakaPlans) => {
  const teacherId = teacher._id.toString();
  const teacherJobs = jobs.filter((job) => job.teacher.toString() === teacherId);
  const teacherAchievements = achievements.filter(
    (ach) => ach.from.id.toString() === teacherId,
  );
  const teacherSpecials = specials.filter(
    (special) => special.from.id.toString() === teacherId,
  );
  const approvedSpecials = teacherSpecials.filter(
    (special) => special.status === "Tasdiqlandi",
  );
  const teacherMalakaPlans = malakaPlans.filter(
    (plan) => plan.from.id.toString() === teacherId,
  );

  return {
    ...teacher,
    jobs: teacherJobs,
    jobsCount: teacherJobs.length,
    normalAchievementsCount: teacherAchievements.length,
    approvedAchievementsCount: teacherAchievements.filter(
      (ach) => ach.status === "Tasdiqlandi",
    ).length,
    specialAchievementsCount: teacherSpecials.length,
    approvedSpecialAchievementsCount: approvedSpecials.length,
    achievementsCount: teacherAchievements.length + approvedSpecials.length,
    hasSpecial: approvedSpecials.length > 0,
    specialAchievements: teacherSpecials,
    totalPoints: getApprovedPoints(teacherAchievements),
    malakaPlans: teacherMalakaPlans,
    nextMalaka: getNextMalaka(teacherMalakaPlans),
  };
};

router.get("/teacher/regions", async (req, res) => {
  try {
    res.json({ data: provinces, status: "success" });
  } catch (error) {
    res.json({ message: error.message, status: "error" });
  }
});

router.get("/teacher/districts/:province", async (req, res) => {
  try {
    const { province } = req.params;
    const districts = DISTRICTS[province] || [];
    res.json({ data: districts, status: "success" });
  } catch (error) {
    res.json({ message: error.message, status: "error" });
  }
});

router.get("/teacher/sorted-regions", adminAuth, async (req, res) => {
  try {
    const teachers = await teacherModel.find();
    let regions = ["Toshkent", "Nukus", "Samarqand", "Fargʻona"];
    // Filial admin faqat o'z filialini ko'radi
    if (req.admin.role !== "superadmin" && req.admin.filial) {
      regions = regions.filter((r) => r === req.admin.filial);
    }
    const sortedTeacher = regions.map((item) => {
      return {
        region: item,
        teachers: teachers.filter((c) => c.region?.region == item),
      };
    });
    res.json(sortedTeacher);
  } catch (error) {
    res.json(error);
  }
});

router.post("/teacher/create", async (req, res) => {
  try {
    const { firstName, lastName, phone, password, province, district } = req.body;

    // Telefonni kanonik shaklga keltirish: +998XXXXXXXXX
    const last9 = String(phone).replace(/\D/g, "").slice(-9);
    const canonicalPhone = "+998" + last9;

    // Oxirgi 9 raqam bo'yicha takrorlanishni tekshirish (format har xil bo'lishi mumkin)
    const findTeacher = await teacherModel.findOne({
      phone: { $regex: last9 + "$" },
    });

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
      phone: canonicalPhone,
      password: hashedPassword,
      region: province,
      district: district || "",
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
    // Oxirgi 9 raqam bo'yicha moslashtirish (bazadagi formatlar har xil)
    const last9 = String(phone).replace(/\D/g, "").slice(-9);
    const findTeacher = await teacherModel.findOne({
      phone: { $regex: last9 + "$" },
    });
    if (!findTeacher) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday teacher topilmadi" });
    }
    const comparePassword = await bcrypt.compare(
      password,
      findTeacher.password,
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
      },
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
      // Foydalanuvchi o'chirilgan bo'lsa — 401, client login'ga yo'naltiradi
      return res
        .status(401)
        .json({ status: "error", message: "Bunday Teacher topilmadi" });
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
      },
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
    await malakaOshirishModel.deleteMany({ "from.id": id });
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

router.get("/teachers", adminAuth, async (req, res) => {
  try {
    // Filial admin faqat o'z filialidagi mutaxassislarni ko'radi
    const teacherFilter = {};
    if (req.admin.role !== "superadmin" && req.admin.filial) {
      teacherFilter["region.region"] = req.admin.filial;
    }
    const teachers = await teacherModel.find(teacherFilter, "-password").lean();
    const teacherIds = teachers.map((teacher) => teacher._id);
    const [jobs, achievements, specials, malakaPlans] = await Promise.all([
      jobModel.find({ teacher: { $in: teacherIds } }).lean(),
      fileModel.find({ "from.id": { $in: teacherIds } }).lean(),
      specialAchievementModel.find({ "from.id": { $in: teacherIds } }).lean(),
      malakaOshirishModel.find({ "from.id": { $in: teacherIds } }).lean(),
    ]);

    const result = teachers.map((teacher) =>
      withTeacherStats(teacher, jobs, achievements, specials, malakaPlans),
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/teacher/:id", async (req, res) => {
  try {
    const teacher = await teacherModel
      .findById(req.params.id)
      .select("-password")
      .lean();
    if (!teacher)
      return res.status(404).json({ message: "O'qituvchi topilmadi" });
    const [jobs, achievements, specials, malakaPlans] = await Promise.all([
      jobModel.find({ teacher: req.params.id }).lean(),
      fileModel.find({ "from.id": req.params.id }).lean(),
      specialAchievementModel.find({ "from.id": req.params.id }).lean(),
      malakaOshirishModel.find({ "from.id": req.params.id }).lean(),
    ]);

    res.json(withTeacherStats(teacher, jobs, achievements, specials, malakaPlans));
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
