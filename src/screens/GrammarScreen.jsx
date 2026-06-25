import { useState } from 'react';
import { grammarData } from '../data/content';
import { speakJapanese } from '../utils/ai';
import { ScreenHeader, showToast } from '../components/UI';
import useStore from '../store/useStore';

export default function GrammarScreen({ level, onBack }) {
  const { markGrammarMastered, addXP } = useStore();
  const data = grammarData[level] || [];
  const [idx, setIdx] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizInput, setQuizInput] = useState('');
  const [quizChecked, setQuizChecked] = useState(false);

  if (!data.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ScreenHeader onBack={onBack} title={`${level} Grammar`} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No grammar data for {level}.</div>
    </div>
  );

  const current = data[idx];

  const next = () => {
    setQuizMode(false); setQuizInput(''); setQuizChecked(false);
    if (idx + 1 < data.length) setIdx(i => i + 1);
    else showToast('All grammar points reviewed! 🎌', 'success');
  };

  const checkQuiz = () => {
    setQuizChecked(true);
    markGrammarMastered(level, current.point);
    addXP(15);
    showToast('+15 XP! Review the reference below', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader onBack={onBack} title={`${level} Grammar`} sub={`${idx + 1} of ${data.length} points`} />
      <div style={{ height: 4, background: 'var(--border)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${Math.round((idx / data.length) * 100)}%`, background: 'var(--teal)', transition: 'width 0.3s' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>
        {/* Point header */}
        <div style={{ background: 'var(--ink)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Grammar Point</div>
          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-jp)', color: '#e8c96b', marginBottom: 4 }}>{current.point}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: 8 }}>{current.romaji}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{current.meaning}</div>
        </div>

        {/* Explanation */}
        <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>📝 EXPLANATION</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.75 }}>{current.note}</div>
        </div>

        {/* Example */}
        <div style={{ background: 'var(--teal-light)', border: '0.5px solid var(--teal)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600, marginBottom: 8 }}>💬 EXAMPLE</div>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-jp)', fontWeight: 500, marginBottom: 6, lineHeight: 1.6 }}>{current.example}</div>
          <div style={{ fontSize: 12, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: 8 }}>{current.exampleRomaji}</div>
          <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 12 }}>{current.exampleEn}</div>
          <button onClick={() => speakJapanese(current.example)}
            style={{ background: 'rgba(11,110,90,0.12)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: 'var(--teal)', cursor: 'pointer', fontFamily: 'var(--font-sans)', minHeight: 36 }}>
            🔊 Listen
          </button>
        </div>

        {/* Common mistake */}
        <div style={{ background: 'var(--red-light)', border: '0.5px solid var(--red-mid)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, marginBottom: 6 }}>⚠️ COMMON MISTAKE</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>{current.mistake}</div>
        </div>

        {/* Mini quiz */}
        {!quizMode ? (
          <button onClick={() => setQuizMode(true)}
            style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '15px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            ✏️ Practice using this grammar
          </button>
        ) : (
          <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
              Write a sentence using <span style={{ fontFamily: 'var(--font-jp)', color: 'var(--ink)', fontWeight: 700 }}>{current.point}</span>
            </div>
            <textarea
              value={quizInput}
              onChange={e => setQuizInput(e.target.value)}
              placeholder="Type your sentence in Japanese..."
              rows={3}
              style={{
                width: '100%', border: '0.5px solid var(--border)', borderRadius: 8, padding: '12px',
                /* 16px to prevent iOS zoom */
                fontSize: 16, fontFamily: 'var(--font-jp)', outline: 'none', resize: 'none', lineHeight: 1.7,
              }}
            />
            {quizChecked && (
              <div style={{ marginTop: 10, padding: '12px', background: 'var(--gold-light)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Reference answer:</div>
                <div style={{ fontSize: 16, fontFamily: 'var(--font-jp)', marginBottom: 4 }}>{current.example}</div>
                <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{current.exampleEn}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {!quizChecked
                ? <button onClick={checkQuiz} disabled={!quizInput.trim()}
                    style={{ flex: 1, background: quizInput.trim() ? 'var(--teal)' : 'var(--mist-dark)', color: quizInput.trim() ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 500, cursor: quizInput.trim() ? 'pointer' : 'default', fontFamily: 'var(--font-sans)' }}>
                    Check ✓
                  </button>
                : <button onClick={next}
                    style={{ flex: 1, background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    {idx + 1 < data.length ? 'Next point →' : 'Finish 🎌'}
                  </button>
              }
            </div>
          </div>
        )}

        {/* Dot navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {data.map((_, i) => (
            <button key={i}
              onClick={() => { setIdx(i); setQuizMode(false); setQuizInput(''); setQuizChecked(false); }}
              style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 10, border: 'none', cursor: 'pointer', background: i === idx ? 'var(--ink)' : 'var(--border)', transition: 'all 0.2s', minWidth: 8 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
