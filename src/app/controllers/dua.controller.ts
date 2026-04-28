import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { optionalVerifyToken } from "../middleware/optionalVerifyToken";
import { DuaHistory } from "../models/duaHistory.model";
import { verifyToken } from "../middleware/verifytoken";

dotenv.config();
export const duaRoutes = express.Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Trim & lowercase the user's emotion input */
const normalizeEmotion = (emotion: string): string =>
  emotion.trim().toLowerCase().substring(0, 120);

/** Reject obviously out-of-range Quran references */
const isValidQuranRef = (surah: number, ayah: number): boolean =>
  surah >= 1 && surah <= 114 && ayah >= 1 && ayah <= 300;

/** Build a rich, role-specific prompt */
const buildPrompt = (emotion: string): string => {
  const isPositive = /happy|good|great|grateful|thankful|blessed|success|joy|excited|peaceful/i.test(emotion);
  
  return `You are an expert Islamic scholar with deep Quranic and Hadith knowledge.
A Muslim is experiencing the following feeling: "${emotion}"

TASK:
1. Identify the emotional category: Is it positive (happiness/gratitude), negative (sadness/anxiety/hardship), or seeking (guidance/knowledge)?
2. Choose the SINGLE most relevant and beautiful Quranic verse for this exact feeling.
   - If positive: Choose verses of Shukr (gratitude) or Allah's blessings (e.g., Surah Ar-Rahman, Surah Ibrahim:7, etc.).
   - If negative: Choose verses of Sabr (patience), hope, or comfort (e.g., Surah Ash-Sharh, Surah Ad-Duhaa, Surah Al-Baqarah:286, etc.).
   - Avoid repeating Surah 94:5 or 93:5 unless specifically appropriate for hardship. 
3. Choose a highly relevant Masnoon Dua (from Sunnah/Hadith) that matches the feeling.
   - For gratitude: Use "Alhamdulillah" variants or Shukur duas.
   - For anxiety: Use "Allahumma inni a'udhu bika minal hammi..." etc.

Respond ONLY with a valid JSON object containing exactly these keys:
{
  "surah_number": integer (1-114),
  "ayah_number": integer,
  "reason": "One concise sentence in English explaining why this verse perfectly addresses the feeling '${emotion}'",
  "masnoon_dua_arabic": "Arabic text of the Sunnah Dua",
  "masnoon_dua_english": "English translation of the Sunnah Dua"
}

No markdown, no extra text. Pure JSON only.`.trim();
};

// ─── AI call with retry ───────────────────────────────────────────────────────

interface AIResult {
  surah_number: number;
  ayah_number: number;
  reason: string;
  masnoon_dua_arabic: string;
  masnoon_dua_english: string;
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
              content: "You are an expert Islamic scholar. You respond only in valid JSON. No preamble, no markdown.",
            },
            { role: "user", content: buildPrompt(emotion) },
          ],
          temperature: 0.4, // Slightly higher for diversity
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const raw: string = response.data.choices[0]?.message?.content ?? "";
      
      // Attempt to clean up the response if it contains markdown code blocks
      const cleanJson = raw.replace(/```json|```/g, "").trim();

      const tryParse = (str: string): AIResult | null => {
        try {
          const parsed = JSON.parse(str);
          if (
            typeof parsed.surah_number === "number" &&
            typeof parsed.ayah_number === "number" &&
            isValidQuranRef(parsed.surah_number, parsed.ayah_number) &&
            parsed.masnoon_dua_arabic &&
            parsed.masnoon_dua_english
          ) {
            return parsed as AIResult;
          }
        } catch {
          return null;
        }
        return null;
      };

      const parsed = tryParse(cleanJson);
      if (parsed) return parsed;

      // Regex fallback for stubborn models
      const match = cleanJson.match(/\{[\s\S]*?\}/);
      if (match) {
        const extracted = tryParse(match[0]);
        if (extracted) return extracted;
      }
    } catch (error: any) {
      console.error(`AI Attempt ${attempt} failed:`, error.message);
      if (attempt === retries) throw error;
    }
  }

  throw new Error("Failed to get valid AI response after retries.");
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
      // 1️⃣ Ask AI for the best verse + reason
      const { 
        surah_number, 
        ayah_number, 
        reason, 
        masnoon_dua_arabic, 
        masnoon_dua_english 
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
        surah_name:        arabicData.surah.englishName ?? `Surah ${surah_number}`,
        surah_name_arabic: arabicData.surah.name,
        surah_number,
        ayah_number:       ayah_number.toString(),
        arabic:            arabicData.text ?? "",
        translation:       translationRes.data.data.text ?? "",
        short_explanation: reason,
        masnoon_dua_arabic,
        masnoon_dua_english,
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
