import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { optionalVerifyToken } from "../middleware/optionalVerifyToken";
import { DuaHistory } from "../models/duaHistory.model";
import { verifyToken } from "../middleware/verifytoken";

dotenv.config();
export const duaRoutes = express.Router();

import { curatedDuas } from "../data/curatedDuas";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Trim & lowercase the user's emotion input */
const normalizeEmotion = (emotion: string): string =>
  emotion.trim().toLowerCase().substring(0, 120);

/** Reject obviously out-of-range Quran references */
const isValidQuranRef = (surah: number, ayah: number): boolean =>
  surah >= 1 && surah <= 114 && ayah >= 1 && ayah <= 300;

/** Build a rich, role-specific prompt */
const buildPrompt = (emotion: string): string => {
  const categories = Object.keys(curatedDuas).join(", ");
  
  return `You are an expert Islamic Psychologist and Scholar. 
USER INPUT: "${emotion}"

TASK:
1. Analyze the USER INPUT deeply to understand the underlying emotion.
2. Map this emotion to the BEST FIT from these specific categories: [${categories}].
   - Example: "I feel lost" -> 'confused'
   - Example: "Life is hard" -> 'tired'
   - Example: "I did something wrong" -> 'guilty'
3. If it absolutely doesn't fit any of the above, label it as 'other'.
4. If the category is 'other', you MUST provide a HIGHLY AUTHENTIC Quranic verse (Surah and Ayah number) and a valid Masnoon Dua in Arabic. 
   - DO NOT hallucinate. 
   - Arabic must be perfectly formatted.

Respond ONLY with this JSON structure:
{
  "detected_category": "the category name or 'other'",
  "surah_number": integer,
  "ayah_number": integer,
  "reason": "One concise sentence in English explaining why this verse addresses the feeling",
  "masnoon_dua_arabic": "Arabic text",
  "masnoon_dua_english": "English translation",
  "source": "A valid Islamic source (e.g., Tafsir Ibn Kathir, Sahih Bukhari)"
}

Pure JSON only. No preamble.`.trim();
};

// ─── AI call with retry ───────────────────────────────────────────────────────

interface AIResult {
  detected_category: string;
  surah_number: number;
  ayah_number: number;
  reason: string;
  masnoon_dua_arabic: string;
  masnoon_dua_english: string;
  source?: string;
}

const getAIResult = async (emotion: string, retries = 2): Promise<AIResult> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        "https://router.huggingface.co/v1/chat/completions",
        {
          model: "meta-llama/Llama-3.1-8B-Instruct:novita",
          messages: [
            {
              role: "system",
              content: "You are a specialized Emotion Classifier and Islamic Scholar. Your job is to map human feelings to Quranic guidance accurately. Always return valid JSON.",
            },
            { role: "user", content: buildPrompt(emotion) },
          ],
          temperature: 0.1, // Very low for strict classification
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const raw: string = response.data.choices[0]?.message?.content ?? "";
      const cleanJson = raw.replace(/```json|```/g, "").trim();

      const tryParse = (str: string): AIResult | null => {
        try {
          const parsed = JSON.parse(str);
          if (
            parsed.detected_category &&
            typeof parsed.surah_number === "number" &&
            typeof parsed.ayah_number === "number"
          ) {
            return parsed as AIResult;
          }
        } catch {
          return null;
        }
        return null;
      };

      const parsed = tryParse(cleanJson);
      if (parsed) {
        // 🚀 AUTO EMOTION DETECTION CORE LOGIC:
        // If AI detected one of our curated categories, FORCE use of curated data
        const cat = parsed.detected_category.toLowerCase();
        if (curatedDuas[cat]) {
          console.log(`Emotion Detected: ${cat} (Mapped from: "${emotion}")`);
          return { 
            ...curatedDuas[cat], 
            detected_category: cat 
          };
        }
        
        // If 'other', return what AI found but ensure it has required fields
        return parsed;
      }
    } catch (error: any) {
      console.error(`Detection Attempt ${attempt} failed:`, error.message);
      if (attempt === retries) throw error;
    }
  }

  throw new Error("Failed to detect emotion accurately.");
};

// ─── POST /dua/get-dua ───────────────────────────────────────────────────────

duaRoutes.post(
  "/get-dua",
  optionalVerifyToken,
  async (req: Request, res: Response) => {
    const rawEmotion = req.body?.emotion;
    const userId = (req as any)?.userId;

    if (!rawEmotion || typeof rawEmotion !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing 'emotion' in request body.",
      });
    }

    const emotion = normalizeEmotion(rawEmotion);

    try {
      // 1️⃣ Ask AI for the best verse + reason or use curated
      const { 
        detected_category,
        surah_number, 
        ayah_number, 
        reason, 
        masnoon_dua_arabic, 
        masnoon_dua_english,
        source
      } = await getAIResult(emotion);

      // 2️⃣ Fetch Arabic & English in parallel
      const [arabicRes, translationRes] = await Promise.all([
        axios.get(
          `https://api.alquran.cloud/v1/ayah/${surah_number}:${ayah_number}/quran-uthmani`
        ),
        axios.get(
          `https://api.alquran.cloud/v1/ayah/${surah_number}:${ayah_number}/en.asad`
        ),
      ]);

      const arabicData = arabicRes.data.data;

      const dua = {
        detected_category,
        surah_name:        arabicData.surah.englishName ?? `Surah ${surah_number}`,
        surah_name_arabic: arabicData.surah.name,
        surah_number,
        ayah_number:       ayah_number.toString(),
        arabic:            arabicData.text ?? "",
        translation:       translationRes.data.data.text ?? "",
        short_explanation: reason,
        masnoon_dua_arabic,
        masnoon_dua_english,
        source: source || "Islamic Scholar"
      };

      // 3️⃣ Persist to history only for authenticated users
      if (userId) {
        await DuaHistory.create({
          userId,
          emotion,
          surah_name:        dua.surah_name,
          surah_number:      dua.surah_number,
          ayah_number:       dua.ayah_number,
          arabic:            dua.arabic,
          translation:       dua.translation,
          short_explanation: dua.short_explanation,
          masnoon_dua_arabic: dua.masnoon_dua_arabic,
          masnoon_dua_english: dua.masnoon_dua_english,
          source: dua.source
        });
      }

      return res.json({ success: true, dua });
    } catch (error: any) {
      console.error("Dua Error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
);

// ─── GET /dua/dua-history ────────────────────────────────────────────────────

duaRoutes.get(
  "/dua-history",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any)?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const history = await DuaHistory.find({ userId }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, history });
    } catch (error) {
      console.error("History Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
