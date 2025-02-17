import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import TeacherRouter from "./router/teacher.routes.js";
import FileRouter from "./router/file.routes.js";
import AchievmentRouter from "./router/achievment.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Faqat `public` papkasini ochiq qilamiz, `files` emas
app.use("/public", express.static("public"));

// 📌 `files` ichidagi fayllarni token bilan olish
app.get("/files/:filename", authMiddleware, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), "public", "files", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: "File not found" });
    }
  });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Database connected");
});

app.use(TeacherRouter);
app.use(FileRouter);
app.use(AchievmentRouter);

app.listen(7474, () => {
  console.log(`Server started on port 7474`);
});
