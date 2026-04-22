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
const buildPrompt = (emotion: string): string =>
  `You are an expert Islamic scholar with deep Quranic knowledge.
A Muslim is experiencing the following feeling: "${emotion}"

Choose the SINGLE most relevant and comforting Quranic verse for this exact feeling.
Think carefully about the emotional depth — then respond ONLY with a valid JSON object
containing exactly three keys:
  "surah_number" : integer (1-114)
  "ayah_number"  : integer
  "reason"       : one concise English sentence explaining why this verse helps with "${emotion}"
  "masnoon_dua_arabic" : A relevant Dua (supplication) from Sunnah/Hadith in Arabic
  "masnoon_dua_english": English translation of the Masnoon Dua

Example: {
  "surah_number": 94,
  "ayah_number": 5,
  "reason": "Promises relief after hardship, directly comforting a sad heart.",
  "masnoon_dua_arabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
  "masnoon_dua_english": "O Allah, I seek refuge in You from anxiety and sorrow."
}
No markdown, no extra text. Pure JSON only.`.trim();

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
    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "meta-llama/Llama-3.1-8B-Instruct:novita", // ✅ confirmed working
        messages: [
          {
            role: "system",
            content:
              "You are an expert Islamic scholar. Respond ONLY with a valid JSON object. No markdown, no extra text.",
          },
          { role: "user", content: buildPrompt(emotion) },
        ],
        temperature: 0.25,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw: string = response.data.choices[0]?.message?.content ?? "";

    // Try direct parse, then regex extraction
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
        /* ignore */
      }
      return null;
    };

    const direct = tryParse(raw);
    if (direct) return direct;

    const match = raw.match(/\{[\s\S]*?\}/);
    if (match) {
      const extracted = tryParse(match[0]);
      if (extracted) return extracted;
    }

    if (attempt === retries) {
      throw new Error(
        "AI failed to return a valid Quran reference after retries."
      );
    }
  }

  throw new Error("Unexpected error in AI response loop.");
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
