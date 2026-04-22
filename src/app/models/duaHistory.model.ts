import { Schema, model } from "mongoose";

const DuaHistorySchema = new Schema({
  userId:            { type: String, required: true },
  emotion:           { type: String },
  surah_name:        { type: String, required: true },
  surah_number:      { type: Number },
  ayah_number:       { type: Number, required: true },
  arabic:            { type: String, required: true },
  translation:       { type: String, required: true },
  short_explanation: { type: String },
  masnoon_dua_arabic: { type: String },
  masnoon_dua_english: { type: String },
  createdAt:         { type: Date, default: Date.now },
});

export const DuaHistory = model("DuaHistory", DuaHistorySchema);
