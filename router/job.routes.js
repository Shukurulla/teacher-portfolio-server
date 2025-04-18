import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import jobModel from "../models/job.model.js";
import teacherModel from "../models/teachers.model.js";
import fileModel from "../models/files.model.js";

const router = express.Router();

router.post("/job/create", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const findTeacher = await teacherModel.findById(userId);
    if (!findTeacher) {
      return res
        .status(401)
        .json({ status: "error", message: "Bunday ustoz topilmadi" });
    }

    const { title, workplace } = req.body;

    if (!title && !workplace) {
      return res.status(401).json({
        status: "error",
        message: "Iltimos barcha malumotlarni toldiring",
      });
    }

    const createJob = await jobModel.create({
      ...req.body,
      teacher: findTeacher._id,
    });
    if (!createJob) {
      return res
        .status(500)
        .json({ status: "error", message: "Job yaratishda hatolik ketdi" });
    }
    res.status(200).json({
      status: "success",
      data: createJob,
      message: "Job muaffaqiyatli yaratildi",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get("/job/my-jobs", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const findTeacher = await teacherModel.findById(userId);
    if (!findTeacher) {
      return res
        .status(401)
        .json({ status: "error", message: "Bunday ustoz topilmadi" });
    }
    const findJobs = await jobModel.find({ teacher: findTeacher._id });
    res.status(200).json({ status: "success", data: findJobs });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});
router.get("/job/:id", authMiddleware, async (req, res) => {
  try {
    const findJobs = await jobModel.findOne({ _id: req.params.id });
    const findFiles = await fileModel.find({
      "from.job": findJobs._id,
    });

    res
      .status(200)
      .json({ status: "success", data: { job: findJobs, files: findFiles } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.delete("/job/:id", authMiddleware, async (req, res) => {
  try {
    const findJob = await jobModel.findById(req.params.id);
    if (!findJob) {
      return res.status(401).json({
        status: "error",
        message: "Bunday kasb malumotlari topulmadi",
      });
    }
    await jobModel.findByIdAndDelete(findJob._id);
    const findFiles = await fileModel.find({
      "from.job._id": findJob._id,
    });
    for (let i = 0; i < findFiles.length; i++) {
      await fileModel.findByIdAndDelete(findFiles[i]._id);
    }
    res
      .status(200)
      .json({ status: "success", data: "Kasb muaffaqiyatli ochirildi" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.put("/job/:id", authMiddleware, async (req, res) => {
  try {
    const findJob = await jobModel.findById(req.params.id);
    if (!findJob) {
      return res
        .status(401)
        .json({ status: "error", message: "Bunday kasb topilmadi" });
    }
    const editJob = await jobModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: { ...req.body },
      },
      {
        new: true,
      }
    );
    res.status(200).json({ status: "success", data: editJob });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
