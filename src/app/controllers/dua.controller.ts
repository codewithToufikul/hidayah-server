import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { optionalVerifyToken } from "../middleware/optionalVerifyToken";
import { DuaHistory } from "../models/duaHistory.model";
import { verifyToken } from "../middleware/verifytoken";

dotenv.config();
export const duaRoutes = express.Router();

duaRoutes.post("/get-dua", optionalVerifyToken, async (req: Request, res: Response) => {
  const { emotion } = req.body;
  const userId = (req as any)?.userId;

  if (!emotion || typeof emotion !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing 'emotion' in request body.",
    });
  }

  const prompt = `You are an Islamic scholar AI. Respond ONLY with a strictly valid JSON object containing exactly two keys: "surah_number" (number) and "ayah_number" (number). This JSON must represent a Quranic verse that brings comfort to someone feeling "${emotion}". Do NOT include any explanations, markdown, or additional text. Output must be pure JSON only.`;

  try {
    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "meta-llama/Llama-3.1-8B-Instruct:novita",
        messages: [
          {
            role: "system",
            content:
              'You are an Islamic scholar AI. Respond ONLY with a strictly valid JSON object containing exactly two keys: "surah_number" (number) and "ayah_number" (number). Do NOT include any explanations, markdown, or extra text. Output must be pure JSON only.',
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiMessage = response.data.choices[0]?.message?.content;
    let aiResult;

    try {
      aiResult = JSON.parse(aiMessage);
    } catch {
      const match = aiMessage.match(/\{[\s\S]*?\}/);
      if (match) {
        aiResult = JSON.parse(match[0]);
      } else {
        return res.status(500).json({
          success: false,
          error: "Failed to parse AI response.",
          rawResponse: aiMessage,
        });
      }
    }

    const { surah_number, ayah_number } = aiResult;

    if (!surah_number || !ayah_number) {
      return res.status(500).json({
        success: false,
        error: "Missing surah_number or ayah_number from AI.",
        rawResponse: aiResult,
      });
    }

    const arabicRes = await axios.get(
      `https://api.alquran.cloud/v1/ayah/${surah_number}:${ayah_number}/quran-uthmani`
    );

    const translationRes = await axios.get(
      `https://api.alquran.cloud/v1/ayah/${surah_number}:${ayah_number}/en.asad`
    );

    const arabicData = arabicRes.data.data;
    const translationData = translationRes.data.data;

    const dua = {
      surah_name: arabicData.surah.englishName || `Surah ${surah_number}`,
      ayah_number: ayah_number.toString(),
      arabic: arabicData.text || "",
      translation: translationData.text || "",
      short_explanation:
        "এই আয়াতে আল্লাহ মানুষকে সান্ত্বনা দেন ও সঠিক পথে উৎসাহ দেন।",
    };

    if (userId) {
      await DuaHistory.create({
        userId,
        emotion,
        surah_name: dua.surah_name,
        ayah_number: dua.ayah_number,
        arabic: dua.arabic,
        translation: dua.translation,
      });
    }

    return res.json({ success: true, dua });
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.response?.data || error.message,
    });
  }
});

duaRoutes.get("/dua-history", verifyToken, async(req: Request, res: Response)=>{
    try {
    const userId = (req as any)?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const history = await DuaHistory.find({ userId }).sort({ createdAt: -1 }); // Latest first

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})
