import jwt from "jsonwebtoken";
import adminModel from "../models/admin.model.js";

// Token'ni tekshiradi va yangi admin ma'lumotini (role/filial) req.admin ga qo'yadi.
// Rol/filial har doim bazadan olinadi — token eskirsa ham to'g'ri ishlaydi.
export const adminAuth = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await adminModel
      .findById(decoded.userId)
      .select("-password");
    if (!admin) {
      return res
        .status(401)
        .json({ status: "error", message: "Admin topilmadi" });
    }
    req.admin = admin;
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
};

// Faqat super admin uchun. adminAuth dan keyin ishlatiladi.
export const superAdminOnly = (req, res, next) => {
  if (req.admin?.role !== "superadmin") {
    return res
      .status(403)
      .json({ status: "error", message: "Faqat super admin uchun ruxsat" });
  }
  next();
};

export default adminAuth;
