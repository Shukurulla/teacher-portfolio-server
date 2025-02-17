import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilImage: {
      type: String,
    },
  },
  { timestamps: true }
);

const teacherModel = mongoose.model("teacher", teacherSchema);
export default teacherModel;
