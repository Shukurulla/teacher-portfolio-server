import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import mammoth from "mammoth";
import fileModel from "../models/files.model.js";
import teacherModel from "../models/teachers.model.js";
import AchievmentsModel from "../models/achievments.model.js";
import jobModel from "../models/job.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/file/upload", authMiddleware, async (req, res) => {
  try {
    if (!req.files || !req.files.file || !req.body.title) {
      return res.status(400).json({
        status: "error",
        message: "Title yoki fayl topilmadi!",
      });
    }

    const file = req.files.file;
    const title = req.body.title;
    const ext = path.extname(file.name).toLowerCase();
    const baseFileName = `${Date.now()}`;
    const uploadDir = path.join(__dirname, "../public/files");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedPath = path.join(uploadDir, `${baseFileName}${ext}`);
    await file.mv(uploadedPath); // Faylni saqlaymiz

    // Excel faylni bloklaymiz (xlsx, xls)
    if ([".xlsx", ".xls"].includes(ext)) {
      return res.status(400).json({
        status: "error",
        message: "Excel fayllar hozircha qo‘llab-quvvatlanmaydi",
      });
    }

    // O'qituvchi va yutuqni tekshiramiz
    const [findTeacher, findAchievment, findJob] = await Promise.all([
      teacherModel.findById(req.body.teacherId),
      AchievmentsModel.findById(req.body.achievmentId),
      jobModel.findById(req.body.job),
    ]);

    if (!findTeacher || !findAchievment || !findJob) {
      return res.status(400).json({
        status: "error",
        message: "O'qituvchi, yutuq yoki kasb topilmadi",
      });
    }

    // PDF fayl bo‘lsa, faqat yozib chiqamiz, boshqa convert qilinmaydi
    if (ext === ".pdf") {
      const fileUrl = `/files/${baseFileName}.pdf`;
      const newFile = new fileModel({
        fileUrl,
        title,
        fileName: `${baseFileName}.pdf`,
        from: {
          id: req.body.teacherId,
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
      return res.status(201).json({
        status: "success",
        message: "PDF fayl muvaffaqiyatli saqlandi!",
        data: newFile,
      });
    }

    // HTML tarkibini tayyorlaymiz
    let htmlContent = "";

    if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
      const fileUrl = `/files/${baseFileName}${ext}`;
      htmlContent = `<html><body style="margin:0"><img src="https://server.portfolio-sport.uz${fileUrl}" style="max-width:100%"/></body></html>`;
    } else if (ext === ".docx") {
      const result = await mammoth.convertToHtml({ path: uploadedPath });
      htmlContent = `<html><body>${result.value}</body></html>`;
    } else if (ext === ".txt") {
      const text = fs.readFileSync(uploadedPath, "utf8");
      htmlContent = `<html><body><pre>${text}</pre></body></html>`;
    } else {
      return res.status(400).json({
        status: "error",
        message: "Ushbu turdagi fayl qo‘llab-quvvatlanmaydi",
      });
    }

    // HTMLdan PDF yasaymiz
    const pdfFileName = `${baseFileName}.pdf`;
    const pdfPath = path.join(uploadDir, pdfFileName);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load" });
    await page.pdf({ path: pdfPath, format: "A4" });
    await browser.close();

    const fileUrl = `/files/${pdfFileName}`;
    const newFile = new fileModel({
      fileUrl,
      title,
      fileName: pdfFileName,
      from: {
        id: req.body.teacherId,
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
      message: "Fayl PDFga aylantirildi va saqlandi!",
      data: newFile,
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

router.get("/file/:id", async (req, res) => {
  try {
    const findFile = await fileModel.findById(req.params.id);
    res.json({ data: findFile });
  } catch (error) {
    res.json({ message: error.message });
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
export default router;
