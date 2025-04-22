import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import fileModel from "../models/files.model.js"; // Modelni import qilish
import teacherModel from "../models/teachers.model.js";
import AchievmentsModel from "../models/achievments.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
import jobModel from "../models/job.model.js";
import adminModel from "../models/admin.model.js";

const router = express.Router();

// Faylning direktoriyasini olish (__dirname ni es modulda yaratish)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fayllarni yuklash va saqlash routeri

router.post("/file/upload", async (req, res) => {
  try {
    // Fayllar yuklanganligini tekshirish
    if (!req.files || !req.files.files || req.files.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Hech qanday fayl yuklanmadi!",
      });
    }

    // Majburiy maydonlarni tekshirish
    if (
      !req.body.title ||
      !req.body.teacherId ||
      !req.body.achievmentId ||
      !req.body.job
    ) {
      return res.status(400).json({
        status: "error",
        message: "Barcha kerakli maydonlarni to'ldiring!",
      });
    }

    // Fayllarni massivga aylantirish (1 ta yoki ko'p fayl uchun)
    const uploadedFiles = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];

    const title = req.body.title;
    const ratings = JSON.parse(req.body.ratings || "[]");

    // O'qituvchini tekshirish
    const findTeacher = await teacherModel.findById(req.body.teacherId);
    if (!findTeacher) {
      return res.status(400).json({
        status: "error",
        message: "O'qituvchi topilmadi",
      });
    }

    // Yutuqni tekshirish
    const findAchievment = await AchievmentsModel.findById(
      req.body.achievmentId
    );
    if (!findAchievment) {
      return res.status(400).json({
        status: "error",
        message: "Yutuq topilmadi",
      });
    }

    // Kasbni tekshirish
    const findJob = await jobModel.findById(req.body.job);
    if (!findJob) {
      return res.status(400).json({
        status: "error",
        message: "Kasb topilmadi",
      });
    }

    // Avvalgi tasdiqlanmagan fayllarni o'chirish
    const oldFile = await fileModel.findOne({
      "from.id": req.body.teacherId,
      "achievments.id": req.body.achievmentId,
      status: "Tasdiqlanmadi",
    });

    if (oldFile) {
      // Fayllarni jismoniy o'chirish
      oldFile.files.forEach((file) => {
        const filePath = path.join(__dirname, "../public", file.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      await fileModel.findByIdAndDelete(oldFile._id);
    }

    // Yuklash papkasini yaratish (agar mavjud bo'lmasa)
    const uploadDir = path.join(__dirname, "../public/files");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Barcha fayllarni qayta ishlash
    const processedFiles = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      // Fayl nomini yaratish
      const fileExtension = path.extname(file.name);
      const fileName = `${Date.now()}-${i}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Faylni saqlash
      await file.mv(filePath);

      // Fayl ma'lumotlarini saqlash
      processedFiles.push({
        fileUrl: `/files/${fileName}`,
        fileTitle: `${title} - ${ratings[i]?.about || `Fayl ${i + 1}`}`,
        // rating bu yerda belgilanmaydi, keyin tasdiqlashda belgilanadi
      });
    }

    // Yangi fayl yozuvini yaratish
    const newFile = new fileModel({
      files: processedFiles,
      fileName: title,
      from: {
        id: req.body.teacherId,
        firstName: findTeacher.firstName,
        lastName: findTeacher.lastName,
        job: findJob._id,
        region: findTeacher.region,
      },
      achievments: {
        title: findAchievment.title,
        section: findAchievment.section,
        id: req.body.achievmentId,
        ratings: findAchievment.ratings, // asl yutuqning ratinglari
      },
      status: "Tekshirilmoqda",
    });

    await newFile.save();

    res.status(201).json({
      status: "success",
      message: `${processedFiles.length} ta fayl muvaffaqiyatli yuklandi!`,
      data: newFile,
    });
  } catch (error) {
    console.error("Yuklash xatosi:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Server ichki xatosi",
    });
  }
});
router.get("/new-files", async (req, res) => {
  try {
    const files = await fileModel.find({ status: "Tekshirilmoqda" });
    res.status(200).json({ status: "success", data: files });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/file/my-files/", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;

    // Foydalanuvchiga tegishli barcha fayllarni olish
    const myFiles = await fileModel.find({ "from.id": userId });

    // totalBalls hisoblash
    const totalBalls = myFiles.reduce((sum, file) => {
      return sum + (file.achievments?.rating?.rating || 0);
    }, 0);

    res.status(200).json({ status: "success", data: { myFiles, totalBalls } });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.delete("/file/delete/:id", async (req, res) => {
  try {
    const file = await fileModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", data: file });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.post("/file/accept/:id", async (req, res) => {
  try {
    const findFile = await fileModel.findById(req.params.id);
    if (!findFile) {
      return res.status(404).json({
        status: "error",
        message: "Bunday fayl topilmadi",
      });
    }

    // Fayl allaqachon ko'rib chiqilganligini tekshirish
    if (findFile.status !== "Tekshirilmoqda") {
      return res.status(400).json({
        status: "error",
        message: "Fayl allaqachon ko'rib chiqilgan",
      });
    }

    const { ratings, resultMessage, inspector } = req.body;
    const findAdmin = await adminModel.findById(inspector);
    if (!findAdmin) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday admin topilmadi" });
    }
    const findTeacher = await teacherModel.findById(findFile.from.id);
    if (!findTeacher) {
      return res.status(400).json({
        status: "error",
        message: "Bu yutuqqa tegishli teacher topilmadi",
      });
    }
    if (admin.region.region !== findTeacher.region.region) {
      return res.status(400).json({
        status: "error",
        message: "Siz ushbu regionga tegishli filelarni tekshira olmaysiz",
      });
    }

    // Barcha fayllar uchun baho belgilanganligini tekshirish
    if (!ratings || ratings.length !== findFile.files.length) {
      return res.status(400).json({
        status: "error",
        message: "Iltimos, barcha fayllar uchun baho belgilang",
      });
    }

    // Fayllarni yangi ratinglar bilan yangilash
    const updatedFiles = findFile.files.map((file, index) => ({
      ...file,
      rating: ratings[index], // har bir fayl uchun alohida baho
    }));

    // Faylni yangilash
    const acceptFile = await fileModel.findByIdAndUpdate(
      findFile._id,
      {
        $set: {
          status: "Tasdiqlandi",
          resultMessage,
          files: updatedFiles, // yangilangan fayllar
          inspector: { ...findAdmin, date: new Date() },
        },
      },
      { new: true } // yangilangan versiyasini qaytarish
    );

    res.json({
      status: "success",
      message: "Fayl muvaffaqiyatli tasdiqlandi",
      data: acceptFile,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Faylni tasdiqlashda xatolik yuz berdi",
    });
  }
});

router.get("/files/", async (req, res) => {
  try {
    const files = await fileModel.find().sort({ status: 1, createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/file/:id", async (req, res) => {
  try {
    const findFile = await fileModel.findById(req.params.id);
    res.json({ data: findFile });
  } catch (error) {
    res.json({ message: error.message });
  }
});
router.patch("/files/:id", async (req, res) => {
  try {
    const { status, resultMessage, files, inspector } = req.body;
    const findAdmin = await adminModel.findById(inspector);
    if (!findAdmin) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday admin topilmadi" });
    }
    // Yangilanish uchun ma'lumotlar
    const updateData = {
      status,
      resultMessage,
      inspector: { ...findAdmin, date: new Date() },
    };

    // Agar fayllar yangilansa
    if (files) {
      updateData.files = files.map((file) => ({
        ...file,
        // ratingni saqlab qolish yoki yangilash
        rating: file.rating || 0,
      }));
    }

    // Faylni yangilash
    const updatedFile = await fileModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // yangilangan versiyasini qaytarish
    );

    res.json({
      status: "success",
      message: "Fayl muvaffaqiyatli yangilandi",
      data: updatedFile,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message || "Faylni yangilashda xatolik yuz berdi",
    });
  }
});
router.delete("/file/:id", authMiddleware, async (req, res) => {
  try {
    const findFile = await fileModel.findById(req.params.id);
    if (!findFile) {
      return res
        .status(401)
        .json({ status: "error", message: "Bunday yutuq topilmadi" });
    }
    await fileModel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ status: "success", message: "Yutuq muaffaqiyatli ochirildi" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/preview/:id", async (req, res) => {
  try {
    const file = await fileModel.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    // In a real implementation, you might want to:
    // 1. Check file type
    // 2. Process the file (e.g., convert to PDF for preview)
    // 3. Return appropriate content

    res.json({
      url: file.fileUrl,
      type: file.fileName?.split(".").pop() || "file",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
