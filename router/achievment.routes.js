import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import AchievmentsModel from "../models/achievments.model.js";
import fileModel from "../models/files.model.js";

const router = express.Router();

router.get("/achievments/:id", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const { id } = req.params; // Job ID

    // Barcha achievementlarni olish
    const achievments = await AchievmentsModel.find();

    // Foydalanuvchiga tegishli fayllarni olish
    const files = await fileModel.find({ "from.id": userId });

    // Achievmentlarni bo'lim bo'yicha guruhlash
    const achievmentsBySection = [
      ...new Set(achievments.map((item) => item.section)),
    ];

    const sortedAchievments = achievmentsBySection.map((section) => {
      return {
        section: section,
        achievments: achievments
          .filter((achievment) => achievment.section === section)
          .map((achievment) => {
            const isExist = files.some((file) => {
              return (
                file.from.job && // file.from.job mavjud bo‘lishi kerak
                file.from.job._id.toString() === id && // Job ID mos kelishi kerak
                file.achievments.id.toString() === achievment._id.toString() // Yutuq mos kelishi kerak
              );
            });

            return {
              exist: isExist,
              achievmet: {
                _id: achievment._id,
                section: achievment.section,
                title: achievment.title,
                ratings: achievment.ratings,
                createdAt: achievment.createdAt,
                updatedAt: achievment.updatedAt,
              },
            };
          }),
      };
    });

    res.status(200).json({ status: "success", data: sortedAchievments });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.delete("/achievments/all-delete", async (req, res) => {
  try {
    const achievments = await AchievmentsModel.find();
    for (let i = 0; i < achievments.length; i++) {
      await AchievmentsModel.findByIdAndDelete(achievments[i]._id);
    }
    res.status(200).json({ status: "success", data: achievments });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});
router.post("/achievments", authMiddleware, async (req, res) => {
  try {
    const achievment = await AchievmentsModel.create(req.body);
    if (!achievment) {
      return res
        .status(400)
        .json({ status: "error", message: "Yutuq qoshishda hatolik ketdi" });
    }
    res.status(200).json({ status: "success", data: achievment });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.delete("/achievments/delete/:id", async (req, res) => {
  try {
    const findAchievment = await AchievmentsModel.findOne({
      _id: req.params.id,
    });
    if (!findAchievment) {
      return res
        .status(400)
        .json({ status: "error", message: "bunday yutuq topilmadi" });
    }
    await AchievmentsModel.findByIdAndDelete(findAchievment._id);
    res.json(findAchievment);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

export default router;
