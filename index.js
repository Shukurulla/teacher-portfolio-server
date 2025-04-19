import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import TeacherRouter from "./router/teacher.routes.js";
import FileRouter from "./router/file.routes.js";
import AchievmentRouter from "./router/achievment.routes.js";
import JobRouter from "./router/job.routes.js";
import fileUpload from "express-fileupload";
import AdminRouter from "./router/admin.routes.js";
import fileModel from "./models/files.model.js";
import teacherModel from "./models/teachers.model.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/public", express.static("public"));

// 📌 `files` ichidagi fayllarni token bilan olish
app.get("/files/:filename", (req, res) => {
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
  // (async (req, res) => {
  //   console.log("start cleaning");

  //   try {
  //     const files = await fileModel.find();
  //     console.log(files);

  //     for (let i = 0; i < files.length; i++) {
  //       await fileModel.findByIdAndDelete(files[i]._id.toString());
  //     }
  //     console.log("cleaning completed");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // })();
});

app.use(TeacherRouter);
app.use(FileRouter);
app.use(AchievmentRouter);
app.use(JobRouter);
app.use(AdminRouter);

app.get("/", async (req, res) => {
  try {
    res.json({ status: "success", message: "Hello" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.status });
  }
});

app.listen(7474, () => {
  console.log(`Server started on port 7474`);
});
