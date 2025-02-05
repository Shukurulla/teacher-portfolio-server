import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import fileModel from "../models/files.model.js"; // Modelni import qilish
import teacherModel from "../models/teachers.model.js";
import AchievmentsModel from "../models/achievments.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Faylning direktoriyasini olish (__dirname ni es modulda yaratish)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fayllarni yuklash uchun middleware
router.use(fileUpload());

// Fayllarni yuklash va saqlash routeri
router.post("/file/upload", async (req, res) => {
  try {
    console.log(req.body);
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

    // Faylni saqlash manzilini tayyorlash
    const uploadDir = path.join(__dirname, "../public/files");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}_${file.name}`;
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
        from: {
          id: req.body.teacherId, // `from.id` ma'lumoti (tashqi ma'lumot)
          firstName: findTeacher.firstName,
          lastName: findTeacher.lastName,
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

router.get("/file/my-files/", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const myFiles = await fileModel.find({ "from.id": userId });
    res.status(200).json({ status: "success", data: myFiles });
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

export default router;
