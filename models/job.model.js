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
  },
  {
    timestamps: true,
  }
);

const jobModel = mongoose.model("job", jobSchema);
export default jobModel;
