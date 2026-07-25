import express from "express";
import malakaOshirishModel from "../models/malakaOshirish.model.js";
import teacherModel from "../models/teachers.model.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import { directions, getFilialKey } from "../constants/index.js";

const router = express.Router();

// Yo'nalish nomlarini solishtirish uchun (bosh rim raqam/belgilar farqiga chidamli)
const normalizeDirection = (t) =>
  String(t || "")
    .replace(/^\s*[IVX]+\s*\.?\s*/i, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const parseDateAtStartOfDay = (value) => {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      const [, year, month, day] = match;
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));

      if (
        parsed.getFullYear() === Number(year) &&
        parsed.getMonth() === Number(month) - 1 &&
        parsed.getDate() === Number(day)
      ) {
        return parsed;
      }
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

// Teacher: malaka oshirish yozuvi qo'shish (sana + filial; default — viloyat filiali)
router.post("/malaka/create", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const { date, filial, note, province, direction } = req.body;
    if (!date)
      return res
        .status(400)
        .json({ status: "error", message: "Sana majburiy" });

    // Yo'nalishni moslashuvchan solishtiramiz va kanonik ko'rinishda saqlaymiz.
    const findDirection = directions.find(
      (d) => normalizeDirection(d) === normalizeDirection(direction)
    );
    if (!findDirection)
      return res.status(400).json({
        status: "error",
        message: "Korsatilgan yonalishlar tizimda mavjud emas",
      });

    const selectedDate = parseDateAtStartOfDay(date);

    if (!selectedDate)
      return res
        .status(400)
        .json({ status: "error", message: "Sana noto'g'ri" });

    if (selectedDate < getStartOfToday())
      return res.status(400).json({
        status: "error",
        message: "Bugundan oldingi sanani tanlab bo'lmaydi",
      });

    const teacher = await teacherModel.findById(userId);
    if (!teacher)
      return res
        .status(404)
        .json({ status: "error", message: "Mutaxassis topilmadi" });

    const rec = await malakaOshirishModel.create({
      from: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        region: teacher.region,
      },
      date,
      filial: filial || getFilialKey(teacher.region),
      province: province ? province : "",
      direction: findDirection,
      note,
    });
    res
      .status(201)
      .json({ status: "success", message: "Qo'shildi", data: rec });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Teacher: o'z yozuvlari
router.get("/malaka/my", authMiddleware, async (req, res) => {
  const { userId } = req.userData;
  const data = await malakaOshirishModel
    .find({ "from.id": userId })
    .sort({ date: 1 });
  res.json({ status: "success", data });
});

// Teacher: o'z arizasini tahrirlash
router.put("/malaka/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const rec = await malakaOshirishModel.findById(req.params.id);
    if (!rec)
      return res.status(404).json({ status: "error", message: "Topilmadi" });
    // Faqat o'z arizasini tahrirlay oladi
    if (rec.from.id.toString() !== userId)
      return res.status(403).json({ status: "error", message: "Ruxsat yo'q" });

    const { date, filial, note, province, direction } = req.body;
    const update = {};

    if (date !== undefined) {
      const selectedDate = parseDateAtStartOfDay(date);
      if (!selectedDate)
        return res
          .status(400)
          .json({ status: "error", message: "Sana noto'g'ri" });
      if (selectedDate < getStartOfToday())
        return res.status(400).json({
          status: "error",
          message: "Bugundan oldingi sanani tanlab bo'lmaydi",
        });
      update.date = date;
    }

    if (direction !== undefined) {
      const findDirection = directions.find(
        (d) => normalizeDirection(d) === normalizeDirection(direction)
      );
      if (!findDirection)
        return res.status(400).json({
          status: "error",
          message: "Korsatilgan yonalishlar tizimda mavjud emas",
        });
      update.direction = findDirection;
    }

    if (filial !== undefined) update.filial = filial;
    if (province !== undefined) update.province = province || "";
    if (note !== undefined) update.note = note;

    const updated = await malakaOshirishModel.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    res.json({ status: "success", message: "Yangilandi", data: updated });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Teacher: o'chirish
router.delete("/malaka/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const rec = await malakaOshirishModel.findById(req.params.id);
    if (!rec)
      return res.status(404).json({ status: "error", message: "Topilmadi" });
    // Faqat o'z arizasini o'chira oladi
    if (rec.from.id.toString() !== userId)
      return res.status(403).json({ status: "error", message: "Ruxsat yo'q" });
    await malakaOshirishModel.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "O'chirildi" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Admin/superadmin: ro'yxat — filial bo'yicha (kim qachon qayerga)
router.get("/malaka", adminAuth, async (req, res) => {
  const filter = {};
  if (req.admin.role !== "superadmin" && req.admin.filial)
    filter.filial = req.admin.filial;
  const data = await malakaOshirishModel.find(filter).sort({ date: 1 });
  res.json({ status: "success", data });
});

export default router;
