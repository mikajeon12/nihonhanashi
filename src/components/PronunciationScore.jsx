import { useState, useEffect } from 'react';
import { scorePronunciation } from '../utils/ai';
import useStore from '../store/useStore';

const scoreColors = {
  5: { bg: '#e0f3ee', color: '#0b6e5a', bar: 'var(--teal)' },
  4: { bg: '#eaf3de', color: '#3b6d11', bar: '#4a8a18' },
  3: { bg: '#fdf8ec', color: '#854f0b', bar: 'var(--gold)' },
  2: { bg: '#faeeda', color: '#854f0b', bar: '#c97a1a' },
  1: { bg: '#fdf0ee', color: '#c0392b', bar: 'var(--red)' },
};
const scoreEmoji = { 5: '🏆', 4: '⭐', 3: '👍', 2: '🔄', 1: '💪' };

export default function PronunciationScore({ spokenText, expectedJP, expectedEN, onDismiss }) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const { addPronunciationScore, addXP } = useStore();

  // Fix: run scoring in useEffect, never during render
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    scorePronunciation(spokenText, expectedJP, expectedEN).then(r => {
      if (cancelled) return;
      setResult(r);
      setLoading(false);
      addPronunciationScore({ text: expectedJP, spokenText, ...r, date: Date.now() });
      const xpMap = { 5: 20, 4: 15, 3: 10, 2: 5, 1: 3 };
      addXP(xpMap[r.score] || 5);
    });
    return () => { cancelled = true; };
  }, [spokenText, expectedJP]);

  const c = result ? (scoreColors[result.score] || scoreColors[3]) : scoreColors[3];

  return (
    <div style={overlay} onClick={onDismiss}>
      <div style={sheet} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 10, margin: '12px auto 20px' }} />
        <div style={{ padding: '0 20px 28px' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Scoring your pronunciation...</div>
            </div>
          ) : result ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 52, marginBottom: 8 }}>{scoreEmoji[result.score]}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.color, marginBottom: 2 }}>{result.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Pronunciation Score</div>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: 20, height: 8, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${(result.score / 5) * 100}%`, background: c.bar, borderRadius: 20, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 18 }}>
                {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
              </div>
              <div style={{ background: 'var(--mist)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>YOU SAID</div>
                <div style={{ fontSize: 15, fontFamily: 'var(--font-jp)', marginBottom: 8 }}>{spokenText || '(not detected)'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>EXPECTED</div>
                <div style={{ fontSize: 15, fontFamily: 'var(--font-jp)', color: 'var(--teal)', fontWeight: 500 }}>{expectedJP}</div>
              </div>
              <div style={{ background: c.bg, border: `1px solid ${c.color}30`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: c.color, fontWeight: 500 }}>{result.feedback}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onDismiss} style={{ flex: 1, background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '13px', fontSize: 13, color: 'var(--text-soft)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Close</button>
                <button onClick={onDismiss} style={{ flex: 2, background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Keep chatting 🗣️</button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.65)', zIndex: 600, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' };
const sheet   = { background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, margin: '0 auto', animation: 'slide-up 0.28s cubic-bezier(0.4,0,0.2,1)' };
