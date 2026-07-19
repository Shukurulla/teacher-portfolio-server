import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import adminModel from "../models/admin.model.js";

dotenv.config();

// Super admin yaratadi. Login/parolni env yoki shu yerdan o'zgartiring.
// Ishga tushirish:  node seed/superadmin.seed.js
const USERNAME = process.env.SUPERADMIN_USERNAME || "superadmin";
const PASSWORD = process.env.SUPERADMIN_PASSWORD || "SuperAdmin2026!";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database connected");

  const existing = await adminModel.findOne({ role: "superadmin" });
  if (existing) {
    existing.username = USERNAME;
    existing.password = await bcrypt.hash(PASSWORD, 10);
    existing.role = "superadmin";
    existing.filial = undefined;
    await existing.save();

    console.log("✅ Super admin yangilandi:");
    console.log(`   username: ${existing.username}`);
    console.log(`   password: ${PASSWORD}`);
    await mongoose.disconnect();
    return;
  }

  const clash = await adminModel.findOne({ username: USERNAME });
  if (clash) {
    console.log(
      `"${USERNAME}" username band. SUPERADMIN_USERNAME env orqali boshqa nom bering.`
    );
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  const superadmin = await adminModel.create({
    username: USERNAME,
    password: hashedPassword,
    role: "superadmin",
  });

  console.log("✅ Super admin yaratildi:");
  console.log(`   username: ${superadmin.username}`);
  console.log(`   password: ${PASSWORD}`);
  console.log("⚠️  Kirgach parolni almashtiring.");

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
