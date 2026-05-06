export interface CuratedDua {
  surah_number: number;
  ayah_number: number;
  reason: string;
  masnoon_dua_arabic: string;
  masnoon_dua_english: string;
  category: string;
  source: string;
}

export const curatedDuas: Record<string, CuratedDua> = {
  sad: {
    surah_number: 94,
    ayah_number: 5,
    reason:
      "This verse highlights that true relief is inseparable from hardship. As explained in Tafsir Ibn Kathir, Allah emphasizes that for every difficulty, He creates two types of ease, ensuring the believer never loses hope.",
    masnoon_dua_arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
    masnoon_dua_english:
      "O Ever Living, O Sustainer, in Your mercy I seek relief.",
    category: "sadness",
    source: "Tafsir Ibn Kathir (Surah Ash-Sharh)",
  },

  anxious: {
    surah_number: 13,
    ayah_number: 28,
    reason:
      "Classical tafsir notes that the heart finds tranquility solely through the Dhikr (remembrance) of Allah. Ibn Kathir explains that when the heart knows its Creator, it becomes settled and calm, free from the storms of anxiety.",
    masnoon_dua_arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    masnoon_dua_english:
      "O Allah, I seek refuge in You from anxiety and sorrow.",
    category: "anxiety",
    source: "Tafsir Ibn Kathir (Surah Ar-Ra'd)",
  },

  scared: {
    surah_number: 2,
    ayah_number: 153,
    reason:
      "Scholars emphasize that during times of fear or distress, the believer should use patience (Sabr) and prayer (Salah) as their primary tools for strength. Ibn Kathir mentions that these are the greatest aids in navigating life's trials.",
    masnoon_dua_arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    masnoon_dua_english:
      "Allah is sufficient for us, and He is the best disposer of affairs.",
    category: "fear",
    source: "Tafsir Ibn Kathir (Surah Al-Baqarah)",
  },

  happy: {
    surah_number: 14,
    ayah_number: 7,
    reason:
      "This verse establishes the divine law of Shukr (gratitude). As explained in Tafsir al-Jalalayn, acknowledging Allah's blessings is the key to their preservation and increase, turning momentary happiness into lasting peace.",
    masnoon_dua_arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
    masnoon_dua_english:
      "All praise is for Allah by whose favor good deeds are completed.",
    category: "gratitude",
    source: "Tafsir al-Jalalayn (Surah Ibrahim)",
  },

  tired: {
    surah_number: 2,
    ayah_number: 286,
    reason:
      "Ibn Kathir explains that this verse serves as a source of immense mercy, highlighting that Allah never mandates anything beyond human capacity. It offers psychological relief to those feeling overwhelmed by life's burdens.",
    masnoon_dua_arabic:
      "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    masnoon_dua_english:
      "O Allah, I hope for Your mercy, so do not leave me to myself even for a moment.",
    category: "hardship",
    source: "Tafsir Ibn Kathir (Surah Al-Baqarah)",
  },

  angry: {
    surah_number: 3,
    ayah_number: 134,
    reason:
      "The verse praises those who suppress their anger (Al-Kazimin al-Ghayz). As noted in classical tafsir, this is not just about holding it in, but actively forgiving others for the sake of Allah's love.",
    masnoon_dua_arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    masnoon_dua_english: "I seek refuge in Allah from the accursed devil.",
    category: "anger",
    source: "Tafsir Ibn Kathir (Surah Ali 'Imran)",
  },

  confused: {
    surah_number: 1,
    ayah_number: 6,
    reason:
      "Tafsir al-Jalalayn notes that asking for 'The Straight Path' is the most comprehensive prayer for clarity and direction. It is the ultimate antidote to spiritual and mental confusion.",
    masnoon_dua_arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    masnoon_dua_english: "O Allah, guide me and make me steadfast.",
    category: "guidance",
    source: "Tafsir al-Jalalayn (Surah Al-Fatihah)",
  },

  guilty: {
    surah_number: 39,
    ayah_number: 53,
    reason:
      "Ibn Kathir describes this as the most hopeful verse in the Quran. It addresses those who feel they have crossed all limits, reminding them that Allah's mercy is far greater than any sin.",
    masnoon_dua_arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    masnoon_dua_english:
      "I seek forgiveness from Allah and turn to Him in repentance.",
    category: "repentance",
    source: "Tafsir Ibn Kathir (Surah Az-Zumar)",
  },

  lonely: {
    surah_number: 50,
    ayah_number: 16,
    reason:
      "Scholars mention that Allah's 'nearness' is both through His knowledge and His support. As explained in classical tafsir, realizing that He is closer than our jugular vein effectively ends the feeling of being alone.",
    masnoon_dua_arabic:
      "حَسْبِيَ اللَّهُ لا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ",
    masnoon_dua_english:
      "Allah is sufficient for me. There is no god but Him. I place my trust in Him.",
    category: "loneliness",
    source: "Tafsir Ibn Kathir (Surah Qaf)",
  },
};
