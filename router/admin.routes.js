import express from "express";
import adminModel from "../models/admin.model.js";
import teacherModel from "../models/teachers.model.js";
import fileModel from "../models/files.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminAuth, superAdminOnly } from "../middleware/adminAuth.middleware.js";
import { FILIALS, FILIAL_KEYS, getFilialByKey } from "../constants/index.js";

const router = express.Router();

router.post("/admin/sign", async (req, res) => {
  try {
    const { username, password, region } = req.body;
    console.log(req.body);

    const findAdmin = await adminModel.findOne({ username });
    if (findAdmin) {
      return res.status(400).json({
        status: "error",
        message: "Bunday username oldin roy'hatdan otgan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createAdmin = await adminModel.create({
      username,
      region,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: createAdmin._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res
      .status(200)
      .json({ status: "success", data: { admin: createAdmin, token } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const findAdmin = await adminModel.findOne({ username });
    if (!findAdmin) {
      return res.status(400).json({
        status: "error",
        message: "Username yoki parol mos kelmadi",
      });
    }

    const comparePassword = await bcrypt.compare(password, findAdmin.password);

    if (!comparePassword) {
      return res
        .status(400)
        .json({ status: "error", message: "Password mos kelmadi" });
    }
    const token = jwt.sign({ userId: findAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res
      .status(200)
      .json({ status: "success", data: { admin: findAdmin, token } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/admin/profile", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const findAdmin = await adminModel.findById(userId).select("-password");
    if (!findAdmin) {
      return res
        .status(401)
        .json({ status: "Error", message: "Bunday admin topilmadi" });
    }
    res.status(200).json({ status: "success", data: findAdmin });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ================== SUPER ADMIN ROUTES ==================

// Filiallar bo'yicha umumiy ko'rinish: har filialga tayinlangan admin(lar) va sanoqlar
router.get("/admin/filials", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const admins = await adminModel.find({ role: "admin" }).select("-password");

    const data = await Promise.all(
      FILIALS.map(async (f) => {
        const filialAdmins = admins.filter((a) => a.filial === f.key);
        const [teacherCount, newCount, approvedCount, rejectedCount] =
          await Promise.all([
            teacherModel.countDocuments({ "region.region": f.key }),
            fileModel.countDocuments({
              "from.region.region": f.key,
              status: "Tekshirilmoqda",
            }),
            fileModel.countDocuments({
              "from.region.region": f.key,
              status: "Tasdiqlandi",
            }),
            fileModel.countDocuments({
              "from.region.region": f.key,
              status: "Tasdiqlanmadi",
            }),
          ]);
        return {
          key: f.key,
          name: f.name,
          admins: filialAdmins,
          teacherCount,
          newCount,
          approvedCount,
          rejectedCount,
        };
      })
    );

    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Barcha adminlar ro'yxati
router.get("/admin/list", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const admins = await adminModel
      .find()
      .select("-password")
      .sort({ createdAt: -1 });
    const withFilialName = admins.map((a) => ({
      ...a.toObject(),
      filialName: getFilialByKey(a.filial)?.name || null,
    }));
    res.json({ status: "success", data: withFilialName });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Filialga admin tayinlash (yaratish)
router.post("/admin/create", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const { username, password, filial } = req.body;
    if (!username || !password || !filial) {
      return res.status(400).json({
        status: "error",
        message: "username, password va filial majburiy",
      });
    }
    if (!FILIAL_KEYS.includes(filial)) {
      return res
        .status(400)
        .json({ status: "error", message: "Noto'g'ri filial" });
    }
    const exists = await adminModel.findOne({ username });
    if (exists) {
      return res
        .status(400)
        .json({ status: "error", message: "Bu username band" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await adminModel.create({
      username,
      password: hashedPassword,
      role: "admin",
      filial,
    });
    const { password: _pw, ...safe } = admin.toObject();
    res.status(201).json({
      status: "success",
      message: "Admin tayinlandi",
      data: { ...safe, filialName: getFilialByKey(filial)?.name },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Adminni tahrirlash (filial almashtirish / parol yangilash)
router.put("/admin/:id", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const { username, filial, password } = req.body;
    const target = await adminModel.findById(req.params.id);
    if (!target) {
      return res
        .status(404)
        .json({ status: "error", message: "Admin topilmadi" });
    }
    if (target.role === "superadmin") {
      return res.status(400).json({
        status: "error",
        message: "Super adminni tahrirlab bo'lmaydi",
      });
    }
    const update = {};
    if (username) update.username = username;
    if (filial) {
      if (!FILIAL_KEYS.includes(filial)) {
        return res
          .status(400)
          .json({ status: "error", message: "Noto'g'ri filial" });
      }
      update.filial = filial;
    }
    if (password) update.password = await bcrypt.hash(password, 10);

    const admin = await adminModel
      .findByIdAndUpdate(req.params.id, update, { new: true })
      .select("-password");
    res.json({
      status: "success",
      message: "Admin yangilandi",
      data: { ...admin.toObject(), filialName: getFilialByKey(admin.filial)?.name },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Adminni o'chirish
router.delete("/admin/:id", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const target = await adminModel.findById(req.params.id);
    if (!target) {
      return res
        .status(404)
        .json({ status: "error", message: "Admin topilmadi" });
    }
    if (target.role === "superadmin") {
      return res.status(400).json({
        status: "error",
        message: "Super adminni o'chirib bo'lmaydi",
      });
    }
    await adminModel.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "Admin o'chirildi" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
