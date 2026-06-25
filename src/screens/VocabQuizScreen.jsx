import { useState, useEffect } from 'react';
import { vocabData } from '../data/content';
import { speakJapanese } from '../utils/ai';
import { ScreenHeader, showToast } from '../components/UI';
import useStore from '../store/useStore';

export default function VocabQuizScreen({ level, onBack }) {
  const { markVocabMastered, addXP } = useStore();
  const data = vocabData[level] || [];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const [shuffled, setShuffled] = useState(() =>
    data[0] ? [...data[0].opts].sort(() => Math.random() - 0.5) : []
  );

  useEffect(() => {
    if (data[idx]) {
      setShuffled([...data[idx].opts].sort(() => Math.random() - 0.5));
      setSelected(null);
    }
  }, [idx]);

  // Guard: no data for this level
  if (!data.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ScreenHeader onBack={onBack} title={`${level} Vocabulary`} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        No vocab data for {level} yet.
      </div>
    </div>
  );

  const current = data[idx];
  const progress = data.length > 0 ? Math.round((idx / data.length) * 100) : 0;

  const choose = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === current.en;
    if (correct) {
      setScore(s => s + 1);
      markVocabMastered(level, current.jp);
      addXP(10);
      showToast('正解！ Correct! 🎉', 'success');
    } else {
      showToast(`不正解。Answer: ${current.en}`, 'error');
    }
    speakJapanese(current.jp);
    setTimeout(() => {
      if (idx + 1 >= data.length) setDone(true);
      else setIdx(i => i + 1);
    }, 1600);
  };

  const restart = () => { setIdx(0); setScore(0); setSelected(null); setDone(false); };

  if (done) {
    const pct = Math.round((score / data.length) * 100);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <ScreenHeader onBack={onBack} title={`${level} Vocabulary`} sub="Quiz complete!" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
          <div style={{ fontSize: 64 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚'}</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--ink)' }}>{score}/{data.length}</div>
          <div style={{ fontSize: 16, color: 'var(--text-soft)' }}>{pct}% correct</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
            {pct >= 80 ? '素晴らしい！Excellent work! You\'ve mastered most of these words.'
              : pct >= 50 ? 'いい調子！Good progress! Keep practicing the ones you missed.'
              : 'もう一度！Keep going — repetition is the key to mastering Japanese vocab.'}
          </div>
          <button onClick={restart} style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Try again</button>
          <button onClick={onBack} style={{ background: 'none', color: 'var(--text-muted)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 28px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Back to JLPT</button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader onBack={onBack} title={`${level} Vocabulary`} sub={`${idx + 1} of ${data.length}`} />
      <div style={{ height: 4, background: 'var(--border)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--red)', transition: 'width 0.3s' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>What does this mean?</div>
          <div style={{ fontSize: 52, fontWeight: 700, fontFamily: 'var(--font-jp)', color: 'var(--ink)', marginBottom: 8, lineHeight: 1.2 }}>{current.jp}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 16 }}>{current.romaji}</div>
          <button onClick={() => speakJapanese(current.jp)} style={{ background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '7px 16px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
            🔊 Hear pronunciation
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shuffled.map((opt, i) => {
            let bg = '#fff', border = '1.5px solid var(--border)', color = 'var(--text)';
            if (selected !== null) {
              if (opt === current.en) { bg = 'var(--teal-light)'; border = '1.5px solid var(--teal)'; color = 'var(--teal)'; }
              else if (opt === selected) { bg = 'var(--red-light)'; border = '1.5px solid var(--red)'; color = 'var(--red)'; }
            }
            return (
              <button key={i} onClick={() => choose(opt)} disabled={selected !== null}
                style={{ background: bg, border, borderRadius: 'var(--radius)', padding: '15px 16px', fontSize: 14, color, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', transition: 'all 0.15s' }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
