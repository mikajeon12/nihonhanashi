import { useState, useEffect } from 'react';
import { kanjiData } from '../data/content';
import { speakJapanese } from '../utils/ai';
import { ScreenHeader, showToast } from '../components/UI';
import useStore from '../store/useStore';

export default function KanjiScreen({ level, onBack }) {
  const { markKanjiMastered, addXP } = useStore();
  const data = kanjiData[level] || [];
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState('learn'); // 'learn' | 'quiz'
  const [selected, setSelected] = useState(null);
  const [shuffled, setShuffled] = useState([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = data[idx];

  useEffect(() => {
    if (current) {
      setShuffled([...current.opts].sort(() => Math.random() - 0.5));
      setSelected(null);
    }
  }, [idx]);

  const next = () => {
    if (idx + 1 >= data.length) { if (mode === 'quiz') setDone(true); else { setIdx(0); setMode('quiz'); } }
    else setIdx(i => i + 1);
  };

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === current.en) {
      setScore(s => s + 1);
      markKanjiMastered(level, current.kanji);
      addXP(12);
      showToast('正解！ ' + current.kanji + ' = ' + current.en, 'success');
    } else {
      showToast(`The answer was: ${current.en}`, 'error');
    }
    speakJapanese(current.kanji);
    setTimeout(next, 1600);
  };

  if (!current) return null;

  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ScreenHeader onBack={onBack} title={`${level} Kanji`} sub="Complete!" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <div style={{ fontSize: 56 }}>🏮</div>
        <div style={{ fontSize: 40, fontWeight: 700 }}>{score}/{data.length}</div>
        <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>Kanji quiz complete!</div>
        <button onClick={() => { setIdx(0); setMode('learn'); setScore(0); setDone(false); }} style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Study again</button>
        <button onClick={onBack} style={{ background: 'none', color: 'var(--text-muted)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '11px 24px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader
        onBack={onBack}
        title={`${level} Kanji`}
        sub={`${mode === 'learn' ? 'Study' : 'Quiz'} · ${idx + 1} of ${data.length}`}
      />
      <div style={{ height: 4, background: 'var(--border)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${Math.round((idx / data.length) * 100)}%`, background: 'var(--gold)', transition: 'width 0.3s' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mode === 'learn' ? (
          // LEARN card
          <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 72, fontFamily: 'var(--font-jp)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1, marginBottom: 8 }}>{current.kanji}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{current.stroke}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Meaning', val: current.en },
                { label: 'On-yomi', val: current.on },
                { label: 'Kun-yomi', val: current.kun },
                { label: 'Example', val: current.example },
              ].map(r => (
                <div key={r.label} style={{ background: 'var(--mist)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, fontFamily: r.label === 'Example' || r.label === 'On-yomi' || r.label === 'Kun-yomi' ? 'var(--font-jp)' : 'inherit' }}>{r.val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--gold-light)', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 2 }}>Example sentence</div>
              <div style={{ fontSize: 14, fontFamily: 'var(--font-jp)', marginBottom: 3 }}>{current.example}</div>
              <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{current.exampleEn}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => speakJapanese(current.kanji)} style={{ flex: 1, background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 12, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>🔊 Listen</button>
              <button onClick={next} style={{ flex: 2, background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                {idx + 1 < data.length ? 'Next →' : 'Start Quiz →'}
              </button>
            </div>
          </div>
        ) : (
          // QUIZ mode
          <>
            <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>What does this kanji mean?</div>
              <div style={{ fontSize: 64, fontFamily: 'var(--font-jp)', fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>{current.kanji}</div>
              <button onClick={() => speakJapanese(current.kanji)} style={{ background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '7px 16px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>🔊 Listen</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {shuffled.map((opt, i) => {
                let bg = '#fff', border = '1.5px solid var(--border)', color = 'var(--text)';
                if (selected) {
                  if (opt === current.en) { bg = 'var(--teal-light)'; border = '1.5px solid var(--teal)'; color = 'var(--teal)'; }
                  else if (opt === selected) { bg = 'var(--red-light)'; border = '1.5px solid var(--red)'; color = 'var(--red)'; }
                }
                return (
                  <button key={i} onClick={() => choose(opt)} disabled={!!selected}
                    style={{ background: bg, border, borderRadius: 'var(--radius)', padding: '15px 16px', fontSize: 14, color, cursor: selected ? 'default' : 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', transition: 'all 0.15s' }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
