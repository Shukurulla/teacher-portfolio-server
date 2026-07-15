import mongoose from "mongoose";

// 18-band maxsus yutuq topshirig'i (VM 355-son qarori NIZOM 19-band)
const specialAchievementSchema = new mongoose.Schema(
  {
    from: {
      id: {
        type: mongoose.Types.ObjectId,
        ref: "teacher",
        required: true,
      },
      firstName: { type: String },
      lastName: { type: String },
      region: { type: Object },
    },
    itemIndex: { type: Number, required: true }, // 0..17
    itemTitle: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    status: {
      type: String,
      default: "Tekshirilmoqda",
      enum: ["Tekshirilmoqda", "Tasdiqlandi", "Tasdiqlanmadi"],
    },
    resultMessage: { type: String },
    inspector: { type: Object },
  },
  { timestamps: true }
);

const specialAchievementModel = mongoose.model(
  "specialAchievement",
  specialAchievementSchema
);

export default specialAchievementModel;
