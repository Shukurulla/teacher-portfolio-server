import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    // "superadmin" — barcha filiallarni ko'radi va admin tayinlaydi.
    // "admin" — faqat o'z filialini ko'radi.
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin",
    },
    // filial kaliti (Nukus / Fargʻona / Samarqand / Toshkent). superadmin uchun bo'sh.
    filial: {
      type: String,
    },
    region: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const adminModel = mongoose.model("admin", adminSchema);

export default adminModel;
