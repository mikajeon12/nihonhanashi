import { useState, useCallback } from 'react';
import { vocabData } from '../data/content';
import { speakJapanese } from '../utils/ai';
import { ScreenHeader, showToast } from '../components/UI';
import useStore from '../store/useStore';

const allVocab = [
  ...vocabData.N5.map(v => ({ ...v, level: 'N5' })),
  ...vocabData.N4.map(v => ({ ...v, level: 'N4' })),
  ...vocabData.N3.map(v => ({ ...v, level: 'N3' })),
];

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeScreen({ onBack }) {
  const { addXP } = useStore();
  const [filter, setFilter] = useState('N5');
  const [pool, setPool] = useState(() => shuffleArray(allVocab.filter(v => v.level === 'N5')));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);

  const changeFilter = (lv) => {
    const newPool = lv === 'All' ? shuffleArray(allVocab) : shuffleArray(allVocab.filter(v => v.level === lv));
    setFilter(lv);
    setPool(newPool);
    setIdx(0);
    setFlipped(false);
  };

  const current = pool[idx % pool.length];

  const next = useCallback((knew) => {
    if (knew) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      addXP(8);
      showToast(`+8 XP · Streak: ${newStreak}🔥`, 'success');
    } else {
      setStreak(0);
      showToast('Keep going! 頑張って！', 'default');
    }
    setTotal(t => t + 1);
    setFlipped(false);
    setIdx(i => (i + 1) % pool.length);
  }, [streak, pool.length, addXP]);

  const handleFlip = () => {
    if (!flipped) speakJapanese(current.jp);
    setFlipped(f => !f);
  };

  if (!current) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader onBack={onBack} title="Quick Drill" sub={`${total} cards · streak ${streak}🔥`} />

      {/* Level filter */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid var(--border)', padding: '8px 16px', display: 'flex', gap: 6, flexShrink: 0 }}>
        {['N5', 'N4', 'N3', 'All'].map(lv => (
          <button key={lv} onClick={() => changeFilter(lv)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer',
              background: filter === lv ? 'var(--ink)' : 'var(--mist)',
              color: filter === lv ? '#fff' : 'var(--text-muted)',
              border: filter === lv ? 'none' : '0.5px solid var(--border)',
              fontWeight: filter === lv ? 500 : 400,
            }}>{lv}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {pool.length} cards
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        {/* Flashcard */}
        <div
          onClick={handleFlip}
          style={{
            width: '100%', minHeight: 220, background: flipped ? 'var(--ink)' : '#fff',
            border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 24, textAlign: 'center', transition: 'background 0.25s',
            boxShadow: 'var(--shadow)', userSelect: 'none',
          }}
        >
          {!flipped ? (
            <>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
                {current.level} · Japanese → English
              </div>
              <div style={{ fontSize: 52, fontFamily: 'var(--font-jp)', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{current.jp}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{current.romaji}</div>
              <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>Tap to reveal</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>Meaning</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#e8c96b', marginBottom: 8 }}>{current.en}</div>
              <div style={{ fontSize: 24, fontFamily: 'var(--font-jp)', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{current.jp}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{current.romaji}</div>
            </>
          )}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {flipped ? 'Did you know it?' : 'Tap the card to flip'}
        </div>

        {flipped && (
          <div style={{ display: 'flex', gap: 10, width: '100%', animation: 'fade-in 0.2s both' }}>
            <button onClick={() => next(false)}
              style={{ flex: 1, background: 'var(--red-light)', border: '1.5px solid var(--red)', borderRadius: 'var(--radius)', padding: '14px', fontSize: 14, color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              ✗ Didn't know
            </button>
            <button onClick={() => next(true)}
              style={{ flex: 1, background: 'var(--teal-light)', border: '1.5px solid var(--teal)', borderRadius: 'var(--radius)', padding: '14px', fontSize: 14, color: 'var(--teal)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              ✓ Knew it!
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%' }}>
          {[
            { label: 'Cards done', val: total },
            { label: 'Streak', val: streak + '🔥' },
            { label: 'Level', val: current.level },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={() => speakJapanese(current.jp)}
          style={{ background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          🔊 Hear pronunciation
        </button>
      </div>
    </div>
  );
}
