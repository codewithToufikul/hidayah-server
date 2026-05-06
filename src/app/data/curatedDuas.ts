export interface CuratedDua {
  surah_number: number;
  ayah_number: number;
  reason: string;
  masnoon_dua_arabic: string;
  masnoon_dua_english: string;
  category: string;
}

export const curatedDuas: Record<string, CuratedDua> = {
  sad: {
    surah_number: 94,
    ayah_number: 5,
    reason:
      "This verse was chosen because sadness often comes from feeling stuck in hardship, and Allah reassures that every difficulty is followed by ease.",
    masnoon_dua_arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
    masnoon_dua_english:
      "O Ever Living, O Sustainer, in Your mercy I seek relief.",
    category: "sadness",
  },

  anxious: {
    surah_number: 13,
    ayah_number: 28,
    reason:
      "This verse was chosen because anxiety creates inner unrest, and Allah teaches that true peace comes only through His remembrance.",
    masnoon_dua_arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    masnoon_dua_english:
      "O Allah, I seek refuge in You from anxiety and sorrow.",
    category: "anxiety",
  },

  scared: {
    surah_number: 2,
    ayah_number: 153,
    reason:
      "This verse was chosen because fear often weakens the heart, and Allah reminds us to seek strength through patience and prayer.",
    masnoon_dua_arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    masnoon_dua_english:
      "Allah is sufficient for us, and He is the best disposer of affairs.",
    category: "fear",
  },

  happy: {
    surah_number: 14,
    ayah_number: 7,
    reason:
      "This verse was chosen because happiness is a blessing, and Allah teaches that gratitude increases those blessings.",
    masnoon_dua_arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
    masnoon_dua_english:
      "All praise is for Allah by whose favor good deeds are completed.",
    category: "gratitude",
  },

  tired: {
    surah_number: 2,
    ayah_number: 286,
    reason:
      "This verse was chosen because feeling tired or overwhelmed often comes from carrying too much, and Allah reminds that He never burdens a soul beyond its capacity.",
    masnoon_dua_arabic:
      "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    masnoon_dua_english:
      "O Allah, I hope for Your mercy, so do not leave me to myself even for a moment.",
    category: "hardship",
  },

  angry: {
    surah_number: 3,
    ayah_number: 134,
    reason:
      "This verse was chosen because anger can lead to harmful actions, and Allah praises those who control their anger and forgive others.",
    masnoon_dua_arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    masnoon_dua_english: "I seek refuge in Allah from the accursed devil.",
    category: "anger",
  },

  confused: {
    surah_number: 1,
    ayah_number: 6,
    reason:
      "This verse was chosen because confusion comes from a lack of clarity, and this is a direct prayer asking Allah for guidance to the straight path.",
    masnoon_dua_arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    masnoon_dua_english: "O Allah, guide me and make me steadfast.",
    category: "guidance",
  },

  guilty: {
    surah_number: 39,
    ayah_number: 53,
    reason:
      "This verse was chosen because guilt can lead to despair, and Allah reassures that He forgives all sins for those who sincerely repent.",
    masnoon_dua_arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    masnoon_dua_english:
      "I seek forgiveness from Allah and turn to Him in repentance.",
    category: "repentance",
  },

  lonely: {
    surah_number: 50,
    ayah_number: 16,
    reason:
      "This verse was chosen because loneliness comes from feeling isolated, and Allah reminds that He is closer to us than our own selves.",
    masnoon_dua_arabic:
      "حَسْبِيَ اللَّهُ لا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ",
    masnoon_dua_english:
      "Allah is sufficient for me. There is no god but Him. I place my trust in Him.",
    category: "loneliness",
  },
};
