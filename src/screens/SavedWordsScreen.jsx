import { useState } from 'react';
import { speakJapanese } from '../utils/ai';
import { ScreenHeader, showToast } from '../components/UI';
import useStore from '../store/useStore';

export default function SavedWordsScreen({ onBack }) {
  const { savedWords, removeWord, addXP } = useStore();
  const [quizMode, setQuizMode]   = useState(false);
  const [quizIdx,  setQuizIdx]    = useState(0);
  const [flipped,  setFlipped]    = useState(false);
  const [score,    setScore]      = useState(0);
  const [total,    setTotal]      = useState(0);
  const [filter,   setFilter]     = useState('');

  const filtered = filter
    ? savedWords.filter(w => w.jp.includes(filter) || w.en.toLowerCase().includes(filter.toLowerCase()) || w.romaji?.toLowerCase().includes(filter.toLowerCase()))
    : savedWords;

  const handleRemove = (jp) => {
    removeWord(jp);
    showToast('Word removed', 'default');
  };

  // ── Quiz mode ──
  const pool = savedWords.length ? savedWords : [];

  const next = (knew) => {
    if (knew) { setScore(s => s + 1); addXP(8); }
    setTotal(t => t + 1);
    setFlipped(false);
    setQuizIdx(i => (i + 1) % pool.length);
  };

  if (quizMode && pool.length > 0) {
    const current = pool[quizIdx % pool.length];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <ScreenHeader
          onBack={() => setQuizMode(false)}
          title="My Words Quiz"
          sub={`${score} correct · ${total} done`}
        />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div
            onClick={() => { if (!flipped) speakJapanese(current.jp); setFlipped(f => !f); }}
            style={{
              width: '100%', minHeight: 200, background: flipped ? 'var(--ink)' : '#fff',
              border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 24, textAlign: 'center', transition: 'background 0.25s',
              boxShadow: 'var(--shadow)', userSelect: 'none',
            }}
          >
            {!flipped ? (
              <>
                <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>What does this mean?</div>
                <div style={{ fontSize: 48, fontFamily: 'var(--font-jp)', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{current.jp}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{current.romaji}</div>
                <div style={{ marginTop: 18, fontSize: 12, color: 'var(--text-muted)' }}>Tap to reveal</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 14 }}>Meaning</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#e8c96b', marginBottom: 8 }}>{current.en}</div>
                <div style={{ fontSize: 20, fontFamily: 'var(--font-jp)', color: 'rgba(255,255,255,0.7)' }}>{current.jp}</div>
              </>
            )}
          </div>
          {flipped && (
            <div style={{ display: 'flex', gap: 10, width: '100%', animation: 'fade-in 0.2s both' }}>
              <button onClick={() => next(false)} style={{ flex: 1, background: 'var(--red-light)', border: '1.5px solid var(--red)', borderRadius: 'var(--radius)', padding: '14px', fontSize: 14, color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>✗ Didn't know</button>
              <button onClick={() => next(true)}  style={{ flex: 1, background: 'var(--teal-light)', border: '1.5px solid var(--teal)', borderRadius: 'var(--radius)', padding: '14px', fontSize: 14, color: 'var(--teal)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>✓ Knew it!</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            {[{ label: 'Correct', val: score, color: 'var(--teal)' }, { label: 'Total', val: total, color: 'var(--ink)' }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Word list ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader
        onBack={onBack}
        title="Saved Words"
        sub={`${savedWords.length} words saved`}
        right={savedWords.length > 0
          ? <button onClick={() => { setQuizMode(true); setQuizIdx(0); setScore(0); setTotal(0); setFlipped(false); }}
              style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 20, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              ⚡ Quiz me
            </button>
          : null
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
        {savedWords.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 14 }}>
            <div style={{ fontSize: 48 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>No saved words yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              In a chat conversation, tap any Japanese message then tap <strong>⭐ Save</strong> to add words here.
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div style={{ padding: '12px 16px 4px' }}>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Search your words..."
                style={{ width: '100%', border: '0.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 16, outline: 'none', background: 'var(--mist)', fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--text-muted)' }}>
              Tap 🔊 to hear · tap ★ to save to quiz · swipe or tap ✕ to remove
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 16px' }}>
              {filtered.map((w, i) => (
                <div key={i} style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, animation: 'fade-in 0.2s both' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontFamily: 'var(--font-jp)', fontWeight: 500, marginBottom: 2 }}>{w.jp}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 2 }}>{w.romaji}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{w.en}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => speakJapanese(w.jp)}
                      style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--mist)', border: '0.5px solid var(--border)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔊</button>
                    <button onClick={() => handleRemove(w.jp)}
                      style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--red-light)', border: '0.5px solid var(--red-mid)', cursor: 'pointer', fontSize: 14, color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && filter && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>No matches for "{filter}"</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
