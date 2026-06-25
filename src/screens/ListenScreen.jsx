import { useState, useEffect } from 'react';
import { listenData } from '../data/content';
import { ScreenHeader, showToast } from '../components/UI';
import useStore from '../store/useStore';

export default function ListenScreen({ level, onBack }) {
  const { addXP } = useStore();
  const data = listenData[level] || [];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  // Stop audio on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const current = data[idx];

  const play = () => {
    if (!current) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const u = new SpeechSynthesisUtterance(current.jp);
    u.lang = 'ja-JP';
    u.rate = 0.75;
    u.pitch = 1;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(u);
  };

  const choose = (i) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === current.correct;
    if (correct) {
      setScore(s => s + 1);
      addXP(15);
      showToast('正解！ Correct! 🎉', 'success');
    } else {
      showToast(`不正解。 Correct: "${current.options[current.correct]}"`, 'error');
    }
  };

  const next = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setSelected(null);
    setShowTranscript(false);
    if (idx + 1 >= data.length) setDone(true);
    else setIdx(i => i + 1);
  };

  if (!data.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ScreenHeader onBack={onBack} title={`${level} Listening`} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        No listening exercises for {level} yet. Coming soon!
      </div>
    </div>
  );

  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ScreenHeader onBack={onBack} title={`${level} Listening`} sub="Complete!" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <div style={{ fontSize: 60 }}>👂</div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>{score}/{data.length}</div>
        <div style={{ fontSize: 14, color: 'var(--text-soft)', textAlign: 'center' }}>
          {score === data.length ? '完璧！Perfect listening! 🏆' : score > 0 ? 'Good effort! Keep training your ear.' : 'Keep practicing — listening takes time!'}
        </div>
        <button onClick={() => { setIdx(0); setScore(0); setSelected(null); setShowTranscript(false); setPlaying(false); setDone(false); }}
          style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Try again</button>
        <button onClick={onBack}
          style={{ background: 'none', color: 'var(--text-muted)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '11px 24px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Back to JLPT</button>
      </div>
    </div>
  );

  if (!current) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader onBack={onBack} title={`${level} Listening`} sub={`${idx + 1} of ${data.length}`} />
      <div style={{ height: 4, background: 'var(--border)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${data.length > 1 ? Math.round((idx / (data.length - 1)) * 100) : 100}%`, background: 'var(--teal)', transition: 'width 0.3s' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Scenario */}
        <div style={{ background: 'var(--ink)', borderRadius: 'var(--radius)', padding: '14px 16px', color: '#fff' }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>Scenario</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{current.scenario}</div>
        </div>

        {/* Player */}
        <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
          <button onClick={play}
            style={{
              width: 64, height: 64, borderRadius: '50%', background: playing ? 'var(--red)' : 'var(--ink)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 26, color: '#fff',
              animation: playing ? 'pulse-ring 1.5s infinite' : 'none',
            }}
          >{playing ? '⏸' : '▶'}</button>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            {playing ? 'Playing Japanese audio...' : 'Tap to play the conversation'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>You can replay as many times as needed</div>
          <button onClick={() => setShowTranscript(t => !t)}
            style={{ background: showTranscript ? 'var(--ink)' : 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '7px 14px', fontSize: 12, color: showTranscript ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            {showTranscript ? 'Hide transcript' : 'Show transcript'}
          </button>

          {showTranscript && (
            <div style={{ marginTop: 14, textAlign: 'left', animation: 'fade-in 0.2s both' }}>
              <div style={{ background: 'var(--mist)', borderRadius: 8, padding: 14, fontSize: 13, fontFamily: 'var(--font-jp)', lineHeight: 2, marginBottom: 10 }}>
                {current.jp.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
              <div style={{ background: 'var(--gold-light)', borderRadius: 8, padding: 14, fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.8 }}>
                {current.en.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          )}
        </div>

        {/* Question */}
        <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>❓ QUESTION</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{current.question}</div>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options.map((opt, i) => {
            let bg = '#fff', border = '1.5px solid var(--border)', color = 'var(--text)';
            if (selected !== null) {
              if (i === current.correct) { bg = 'var(--teal-light)'; border = '1.5px solid var(--teal)'; color = 'var(--teal)'; }
              else if (i === selected && i !== current.correct) { bg = 'var(--red-light)'; border = '1.5px solid var(--red)'; color = 'var(--red)'; }
            }
            return (
              <button key={i} onClick={() => choose(i)} disabled={selected !== null}
                style={{ background: bg, border, borderRadius: 'var(--radius)', padding: '15px 16px', fontSize: 14, color, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontWeight: 600, marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button onClick={next}
            style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: 14, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', animation: 'fade-in 0.2s both' }}>
            {idx + 1 < data.length ? 'Next question →' : 'See results 🎌'}
          </button>
        )}
      </div>
    </div>
  );
}
