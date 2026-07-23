import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    workplace: {
      type: String,
      required: true,
    },
    teacher: {
      type: String,
      required: true,
    },
    province: {
      type: Object,
      default: null,
    },
    district: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const jobModel = mongoose.model("job", jobSchema);
export default jobModel;
