// models/duaHistory.model.ts
import { Schema, model } from "mongoose";

const DuaHistorySchema = new Schema({
  userId: { type: String, required: true },
  emotion: String,
  surah_name: { type: String, required: true },
  ayah_number: { type: Number, required: true },
  arabic: { type: String, required: true },
  translation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const DuaHistory = model("DuaHistory", DuaHistorySchema);
