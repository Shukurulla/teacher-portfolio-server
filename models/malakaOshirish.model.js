import mongoose from "mongoose";

// Malaka oshirish yozuvi — o'qituvchi qachon va qaysi filialga borishi
const malakaOshirishSchema = new mongoose.Schema(
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
    date: { type: Date, required: true },
    filial: { type: String, required: true }, // filial kaliti (default: viloyat filiali)
    province: {
      type: String,
      required: true,
    },
    direction: {
      type: String,
      required: true,
    },
    note: { type: String },
  },
  { timestamps: true },
);

const malakaOshirishModel = mongoose.model(
  "malakaOshirish",
  malakaOshirishSchema,
);

export default malakaOshirishModel;
