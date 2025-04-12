import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import fileModel from "../models/files.model.js"; // Modelni import qilish
import teacherModel from "../models/teachers.model.js";
import AchievmentsModel from "../models/achievments.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
import jobModel from "../models/job.model.js";

const router = express.Router();

// Faylning direktoriyasini olish (__dirname ni es modulda yaratish)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fayllarni yuklash va saqlash routeri
router.post("/file/upload", async (req, res) => {
  try {
    // Fayl va title mavjudligini tekshirish
    if (!req.files || !req.files.file || !req.body.title) {
      return res.status(400).json({
        status: "error",
        message: "Title yoki fayl topilmadi!",
      });
    }

    const file = req.files.file; // Yuklangan fayl
    const title = req.body.title; // Title

    const findTeacher = await teacherModel.findById(req.body.teacherId);
    if (!findTeacher) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday teacher topilmadi" });
    }

    const findAchievment = await AchievmentsModel.findById(
      req.body.achievmentId
    );
    if (!findAchievment) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday yutuq topilmadi" });
    }

    const findJob = await jobModel.findById(req.body.job);
    if (!findJob) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday kasb topilmadi" });
    }

    // Faylni saqlash manzilini tayyorlash
    const uploadDir = path.join(__dirname, "../public/files");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Fayl kengaytmasini olish (masalan .docx, .jpg)
    const fileExtension = path.extname(file.name);

    // Fayl nomini yaratish: hozirgi vaqt + kengaytma
    const fileName = `${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Faylni saqlash
    file.mv(filePath, async (err) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Faylni saqlashda xatolik yuz berdi!",
        });
      }

      // Fayl URL manzilini yaratish
      const fileUrl = `/files/${fileName}`;

      // Ma'lumotni bazaga yozish
      const newFile = new fileModel({
        fileUrl,
        title,
        fileName, // MongoDB modeliga fileName ni qo‘shamiz
        from: {
          id: req.body.teacherId, // `from.id` ma'lumoti (tashqi ma'lumot)
          firstName: findTeacher.firstName,
          lastName: findTeacher.lastName,
          job: findJob,
        },
        achievments: {
          title: findAchievment.title,
          section: findAchievment.section,
          rating: {
            ratingTitle: req.body.ratingTitle,
            rating: req.body.rating,
          },
          id: req.body.achievmentId,
        },
      });

      await newFile.save();

      res.status(201).json({
        status: "success",
        message: "Fayl muvaffaqiyatli yuklandi va saqlandi!",
        data: newFile,
      });
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
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
      return res.json({ status: "error", message: "Bunday file mavjud emas" });
    } else if (findFile.status !== "Tekshirilmoqda") return;

    const acceptFile = await fileModel.findByIdAndUpdate(
      findFile._id,
      {
        $set: {
          status: "Tasdiqlandi",
        },
      },
      { new: true }
    );
    res.json({ data: acceptFile, status: "success" });
  } catch (error) {
    res.json({ status: "error", message: error.message });
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
    const { status, resultMessage } = req.body;
    const updatedFile = await fileModel.findByIdAndUpdate(
      req.params.id,
      { status, resultMessage },
      { new: true }
    );
    res.json(updatedFile);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
