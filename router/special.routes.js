import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import specialAchievementModel from "../models/specialAchievement.model.js";
import teacherModel from "../models/teachers.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import { SPECIAL_ITEMS } from "../constants/index.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 18 ta maxsus yutuq ro'yxati
router.get("/special-items", (req, res) => {
  res.json({ status: "success", data: SPECIAL_ITEMS });
});

// Teacher: maxsus yutuq hujjatini yuklash
router.post("/special/upload", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const itemIndex = Number(req.body.itemIndex);
    if (
      Number.isNaN(itemIndex) ||
      itemIndex < 0 ||
      itemIndex >= SPECIAL_ITEMS.length
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Noto'g'ri band tanlandi" });
    }
    if (!req.files || !req.files.file) {
      return res
        .status(400)
        .json({ status: "error", message: "Hujjat yuklanmadi" });
    }
    const teacher = await teacherModel.findById(userId);
    if (!teacher) {
      return res
        .status(404)
        .json({ status: "error", message: "Mutaxassis topilmadi" });
    }

    const uploadDir = path.join(__dirname, "../public/files");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const file = req.files.file;
    const ext = path.extname(file.name);
    const fileName = `special-${Date.now()}${ext}`;
    await file.mv(path.join(uploadDir, fileName));

    const record = await specialAchievementModel.create({
      from: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        region: teacher.region,
      },
      itemIndex,
      itemTitle: SPECIAL_ITEMS[itemIndex],
      fileUrl: `/files/${fileName}`,
      fileName: file.name,
      status: "Tekshirilmoqda",
    });

    res
      .status(201)
      .json({ status: "success", message: "Hujjat yuborildi", data: record });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Teacher: o'z topshiriqlari
router.get("/special/my", authMiddleware, async (req, res) => {
  const { userId } = req.userData;
  const data = await specialAchievementModel
    .find({ "from.id": userId })
    .sort({ createdAt: -1 });
  res.json({ status: "success", data });
});

// Teacher: o'z topshirig'ini o'chirish
router.delete("/special/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const rec = await specialAchievementModel.findById(req.params.id);
    if (!rec)
      return res.status(404).json({ status: "error", message: "Topilmadi" });
    if (rec.from.id.toString() !== userId)
      return res.status(403).json({ status: "error", message: "Ruxsat yo'q" });
    const fp = path.join(__dirname, "../public", rec.fileUrl);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    await specialAchievementModel.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "O'chirildi" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Admin: yangi (tekshiriladigan) — filial bo'yicha
router.get("/special/new", adminAuth, async (req, res) => {
  const filter = { status: "Tekshirilmoqda" };
  if (req.admin.role !== "superadmin" && req.admin.filial)
    filter["from.region.region"] = req.admin.filial;
  const data = await specialAchievementModel
    .find(filter)
    .sort({ createdAt: -1 });
  res.json({ status: "success", data });
});

// Admin: barchasi — filial bo'yicha
router.get("/special", adminAuth, async (req, res) => {
  const filter = {};
  if (req.admin.role !== "superadmin" && req.admin.filial)
    filter["from.region.region"] = req.admin.filial;
  const data = await specialAchievementModel
    .find(filter)
    .sort({ status: 1, createdAt: -1 });
  res.json({ status: "success", data });
});

// Admin: tasdiqlash/rad etish
router.post("/special/review/:id", adminAuth, async (req, res) => {
  try {
    const { status, resultMessage } = req.body;
    if (!["Tasdiqlandi", "Tasdiqlanmadi"].includes(status)) {
      return res
        .status(400)
        .json({ status: "error", message: "Noto'g'ri holat" });
    }
    const rec = await specialAchievementModel.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resultMessage,
        inspector: {
          id: req.admin._id,
          username: req.admin.username,
          date: new Date(),
        },
      },
      { new: true },
    );
    res.json({ status: "success", message: "Saqlandi", data: rec });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

export default router;
