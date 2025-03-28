import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
    },
    from: {
      id: {
        type: mongoose.Types.ObjectId,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      job: {
        type: Object,
        required: true,
      },
    },
    achievments: {
      id: {
        type: mongoose.Types.ObjectId,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      section: {
        type: String,
        required: true,
      },
      rating: {
        ratingTitle: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
      },
    },
    status: {
      type: String,
      default: "Tekshirilmoqda",
      enum: ["Tekshirilmoqda", "Tasdiqlandi", "Tasdiqlanmadi"],
    },
    resultMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

const fileModel = mongoose.model("file", fileSchema);

export default fileModel;
