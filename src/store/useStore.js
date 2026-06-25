import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // ── User profile ───────────────────────────────────
      hasOnboarded: false,
      userName: '',
      goalLevel: 'N5',
      studyGoal: 'both',
      streak: 0,
      xp: 0,
      lastStudyDate: null,

      // ── Progress ──────────────────────────────────────
      masteredVocab:   { N5: {}, N4: {}, N3: {} },
      masteredGrammar: { N5: {}, N4: {}, N3: {} },
      masteredKanji:   { N5: {}, N4: {}, N3: {} },

      // ── Saved words (from chat tap-to-save) ───────────
      // { jp, romaji, en, scenarioId, savedAt }
      savedWords: [],

      // ── Word of the Day ───────────────────────────────
      // { date: 'Mon Jun 23 2025', wordIdx: 4 }
      wotdRecord: null,

      // ── Keyboard tip shown ────────────────────────────
      keyboardTipShown: false,

      // ── Pronunciation scores ──────────────────────────
      // { text, score, feedback, date }[]
      pronunciationHistory: [],

      // ── Chat histories ────────────────────────────────
      chatHistories: {},

      // ── Onboarding ────────────────────────────────────
      completeOnboarding: ({ userName, goalLevel, studyGoal }) => set({
        hasOnboarded: true,
        userName: userName || 'Learner',
        goalLevel,
        studyGoal,
        streak: 1,
        xp: 0,
        lastStudyDate: new Date().toDateString(),
      }),

      // ── XP & Streak ───────────────────────────────────
      addXP: (amount) => set(s => {
        const today     = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const lastDate  = s.lastStudyDate;
        let streak = s.streak;
        if (lastDate !== today) {
          streak = lastDate === yesterday ? s.streak + 1 : 1;
        }
        return { xp: s.xp + amount, streak, lastStudyDate: today };
      }),

      // ── Mastery ───────────────────────────────────────
      markVocabMastered: (level, word) => set(s => ({
        masteredVocab: { ...s.masteredVocab, [level]: { ...s.masteredVocab[level], [word]: true } },
      })),
      markGrammarMastered: (level, point) => set(s => ({
        masteredGrammar: { ...s.masteredGrammar, [level]: { ...s.masteredGrammar[level], [point]: true } },
      })),
      markKanjiMastered: (level, kanji) => set(s => ({
        masteredKanji: { ...s.masteredKanji, [level]: { ...s.masteredKanji[level], [kanji]: true } },
      })),

      // ── Saved Words ───────────────────────────────────
      saveWord: (word) => set(s => {
        const exists = s.savedWords.some(w => w.jp === word.jp);
        if (exists) return {};
        return { savedWords: [{ ...word, savedAt: Date.now() }, ...s.savedWords] };
      }),
      removeWord: (jp) => set(s => ({
        savedWords: s.savedWords.filter(w => w.jp !== jp),
      })),
      isWordSaved: (jp) => get().savedWords.some(w => w.jp === jp),

      // ── Word of the Day ───────────────────────────────
      getOrSetWotd: (allWords) => {
        const today = new Date().toDateString();
        const rec   = get().wotdRecord;
        if (rec && rec.date === today) return allWords[rec.wordIdx % allWords.length];
        // Pick deterministically by day-of-year so everyone sees the same word
        const dayIdx = Math.floor(Date.now() / 86400000) % allWords.length;
        set({ wotdRecord: { date: today, wordIdx: dayIdx } });
        return allWords[dayIdx];
      },

      // ── Keyboard tip ──────────────────────────────────
      markKeyboardTipShown: () => set({ keyboardTipShown: true }),

      // ── Pronunciation ─────────────────────────────────
      addPronunciationScore: (entry) => set(s => ({
        pronunciationHistory: [entry, ...s.pronunciationHistory].slice(0, 50),
      })),

      // ── Chat ──────────────────────────────────────────
      setChatHistory: (id, history) => set(s => ({
        chatHistories: { ...s.chatHistories, [id]: history },
      })),
      getChatHistory: (id) => get().chatHistories[id] || [],
      clearChatHistory: (id) => set(s => {
        const next = { ...s.chatHistories };
        delete next[id];
        return { chatHistories: next };
      }),

      // ── Reset ─────────────────────────────────────────
      resetProgress: () => set({
        xp: 0, streak: 0, lastStudyDate: null,
        masteredVocab: { N5: {}, N4: {}, N3: {} },
        masteredGrammar: { N5: {}, N4: {}, N3: {} },
        masteredKanji: { N5: {}, N4: {}, N3: {} },
        chatHistories: {}, savedWords: [], pronunciationHistory: [],
      }),
    }),
    {
      name: 'hanashi-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStore;
