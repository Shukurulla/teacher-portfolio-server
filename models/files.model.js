import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    files: [
      {
        fileUrl: {
          type: String,
          required: true,
        },
        fileTitle: {
          type: String,
          required: true,
        },
        rating: { type: Number, default: null },
      },
    ],
    fileName: {
      type: String,
      required: true,
    },
    from: {
      id: {
        type: mongoose.Types.ObjectId,
        ref: "teacher",
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
        type: mongoose.Types.ObjectId,
        ref: "job",
        required: true,
      },
    },
    achievments: {
      id: {
        type: mongoose.Types.ObjectId,
        ref: "achievment",
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
      ratings: {
        type: Object,
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
    inspector: {
      type: Object,
    },
  },
  { timestamps: true }
);

const fileModel = mongoose.model("file", fileSchema);

export default fileModel;
