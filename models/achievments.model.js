import mongoose from "mongoose";
const achievmentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    ratings: [
      {
        about: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

const AchievmentsModel = mongoose.model("achievments", achievmentSchema);
export default AchievmentsModel;
