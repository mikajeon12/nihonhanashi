import { useState, useEffect } from 'react';
import { speakJapanese } from '../utils/ai';
import useStore from '../store/useStore';
import { showToast } from './UI';
import { vocabData } from '../data/content';

const allWords = [
  ...vocabData.N5,
  ...vocabData.N4.slice(0, 10),
  ...vocabData.N3.slice(0, 5),
  { jp: '頑張る',    romaji: 'ganbaru',      en: 'to do one\'s best / hang in there',     example: '頑張れ！', exampleEn: 'Do your best!' },
  { jp: 'なるほど',  romaji: 'naruhodo',     en: 'I see / that makes sense',               example: 'なるほど、そうですね。', exampleEn: 'I see, that\'s right.' },
  { jp: 'よろしく',  romaji: 'yoroshiku',    en: 'please treat me well / nice to meet you',example: 'よろしくお願いします。', exampleEn: 'Please take care of me.' },
  { jp: '大丈夫',    romaji: 'daijoubu',     en: 'it\'s okay / are you alright?',          example: '大丈夫ですか？', exampleEn: 'Are you okay?' },
  { jp: 'お疲れ様',  romaji: 'otsukaresama', en: 'good work / thanks for your hard work',  example: 'お疲れ様でした。', exampleEn: 'Good work today.' },
  { jp: 'もちろん',  romaji: 'mochiron',     en: 'of course / certainly',                  example: 'もちろんです！', exampleEn: 'Of course!' },
  { jp: 'やっぱり',  romaji: 'yappari',      en: 'as expected / after all',                example: 'やっぱりそうか。', exampleEn: 'As I thought.' },
  { jp: '懐かしい',  romaji: 'natsukashii',  en: 'nostalgic / brings back memories',       example: '懐かしいな～', exampleEn: 'How nostalgic...' },
  { jp: 'ちょっと',  romaji: 'chotto',       en: 'a little / just a moment',               example: 'ちょっと待って。', exampleEn: 'Wait a moment.' },
  { jp: '仕方ない',  romaji: 'shikata nai',  en: 'it can\'t be helped',                    example: '仕方ないね。', exampleEn: 'Nothing we can do about it.' },
  { jp: '素晴らしい',romaji: 'subarashii',   en: 'wonderful / magnificent',                example: '素晴らしい！', exampleEn: 'Wonderful!' },
  { jp: '気をつけて',romaji: 'ki wo tsukete', en: 'take care / be careful',               example: '気をつけてね。', exampleEn: 'Take care.' },
];

export default function WordOfTheDay() {
  const { getOrSetWotd, isWordSaved, saveWord, addXP } = useStore();
  const [word,   setWord]   = useState(null);
  const [played, setPlayed] = useState(false);

  // Fix: call getOrSetWotd in useEffect, not during render
  useEffect(() => {
    setWord(getOrSetWotd(allWords));
  }, []);

  if (!word) return null;

  const alreadySaved = isWordSaved(word.jp);

  const handlePlay = () => {
    speakJapanese(word.jp);
    setPlayed(true);
  };

  const handleSave = () => {
    if (alreadySaved) return;
    saveWord({ jp: word.jp, romaji: word.romaji, en: word.en });
    addXP(5);
    showToast('Word saved! ⭐ +5 XP', 'success');
  };

  return (
    <div style={{
      margin: '14px 16px 0',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 18px 16px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -8, top: -8, fontSize: 80, color: 'rgba(232,201,107,0.06)', fontFamily: 'var(--font-jp)', fontWeight: 700, lineHeight: 1, pointerEvents: 'none' }}>
        {word.jp[0]}
      </div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 10 }}>
        ⭐ Word of the Day
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 32, fontFamily: 'var(--font-jp)', fontWeight: 700, color: '#e8c96b', lineHeight: 1.2, marginBottom: 4 }}>{word.jp}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: 4 }}>{word.romaji}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{word.en}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <button onClick={handlePlay} style={{ width: 44, height: 44, borderRadius: '50%', background: played ? 'rgba(11,110,90,0.6)' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>🔊</button>
          <button onClick={handleSave} style={{ width: 44, height: 44, borderRadius: '50%', background: alreadySaved ? 'rgba(232,201,107,0.3)' : 'rgba(255,255,255,0.15)', border: 'none', cursor: alreadySaved ? 'default' : 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} title={alreadySaved ? 'Already saved' : 'Save word'}>
            {alreadySaved ? '★' : '☆'}
          </button>
        </div>
      </div>
      {word.example && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Example</div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-jp)', color: 'rgba(255,255,255,0.75)' }}>{word.example}</div>
          {word.exampleEn && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{word.exampleEn}</div>}
        </div>
      )}
    </div>
  );
}
