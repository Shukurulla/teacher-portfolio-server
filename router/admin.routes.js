import express from "express";
import adminModel from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/admin/sign", async (req, res) => {
  try {
    const { username, password } = req.body;
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
        .json({ status: "error", message: "Passowrd mos kelmadi" });
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
    const findAdmin = await adminModel.findById(userId);
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

export default router;
