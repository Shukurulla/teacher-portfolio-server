import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import TeacherRouter from "./router/teacher.routes.js";
import FileRouter from "./router/file.routes.js";
import AchievmentRouter from "./router/achievment.routes.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("database connected");
});

app.use(TeacherRouter);
app.use(FileRouter);
app.use(AchievmentRouter);
app.listen(3000, () => {
  console.log(`Server has ben started on port 3000`);
});
