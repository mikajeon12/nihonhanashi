import { useState, useRef, useEffect, useCallback } from 'react';
import { phrasePacks, shadowingPhrases } from '../data/content';
import { speakJapanese, startSpeechRecognition, scorePronunciation } from '../utils/ai';
import { ScreenHeader, ProgressBar, showToast } from '../components/UI';
import useStore from '../store/useStore';

const STEP = { LISTEN: 'listen', READY: 'ready', RECORDING: 'recording', SCORING: 'scoring', RESULT: 'result' };

export default function ShadowingScreen({ packId, onBack }) {
  const pack    = phrasePacks.find(p => p.id === packId);
  const phrases = shadowingPhrases[packId] || (pack?.phrases.slice(0, 8) ?? []);

  const [idx,        setIdx]       = useState(0);
  const [step,       setStep]      = useState(STEP.LISTEN);
  const [spokenText, setSpoken]    = useState('');
  const [result,     setResult]    = useState(null);
  const [scores,     setScores]    = useState([]);
  const [speed,      setSpeed]     = useState(0.8);
  const [done,       setDone]      = useState(false);
  const [autoPlay,   setAutoPlay]  = useState(true);

  // Use refs for values needed inside callbacks to avoid stale closures
  const recRef      = useRef(null);
  const stepRef     = useRef(STEP.LISTEN);
  const spokenRef   = useRef('');
  const autoPlayRef = useRef(true);

  // Keep refs in sync with state
  useEffect(() => { stepRef.current = step; },     [step]);
  useEffect(() => { spokenRef.current = spokenText; }, [spokenText]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  const { addXP, addPronunciationScore } = useStore();

  const current  = phrases[idx];
  const progress = phrases.length > 0 ? Math.round((idx / phrases.length) * 100) : 0;

  // Cleanup on unmount
  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    recRef.current?.stop();
  }, []);

  // Auto-play on new phrase — use ref to avoid stale autoPlay value
  useEffect(() => {
    if (!autoPlayRef.current || !current || step !== STEP.LISTEN) return;
    const t = setTimeout(() => playPhrase(), 400);
    return () => clearTimeout(t);
  }, [idx]);                     // only idx — intentional, avoids re-triggering on step changes

  const playPhrase = useCallback(() => {
    if (!current) return;
    window.speechSynthesis?.cancel();
    speakJapanese(current.jp, speed);
    // Estimate TTS duration then advance to READY
    const ms = Math.max((current.jp.length * 180) / speed, 1200);
    setTimeout(() => {
      if (stepRef.current === STEP.LISTEN) setStep(STEP.READY);
    }, ms);
  }, [current, speed]);

  const runScore = useCallback(async (text) => {
    setStep(STEP.SCORING);
    const r = await scorePronunciation(text || '(no speech detected)', current.jp, current.en);
    setResult(r);
    setStep(STEP.RESULT);
    setScores(prev => { const next = [...prev]; next[idx] = r.score; return next; });
    addPronunciationScore({ text: current.jp, spokenText: text, ...r, date: Date.now() });
    const xpMap = { 5: 20, 4: 15, 3: 10, 2: 6, 1: 3 };
    addXP(xpMap[r.score] || 5);
  }, [current, idx, addXP, addPronunciationScore]);

  const startRecording = () => {
    setStep(STEP.RECORDING);
    setSpoken('');
    spokenRef.current = '';
    recRef.current = startSpeechRecognition({
      onResult: (text, isFinal) => {
        setSpoken(text);
        spokenRef.current = text;
        if (isFinal) { recRef.current?.stop(); runScore(text); }
      },
      // Fix stale closure: use ref to check current step
      onEnd: () => {
        if (stepRef.current === STEP.RECORDING) runScore(spokenRef.current || '');
      },
      onError: (msg) => { showToast(msg, 'error'); setStep(STEP.READY); },
    });
  };

  const stopRecording = () => {
    recRef.current?.stop();
    if (spokenRef.current) runScore(spokenRef.current);
    else setStep(STEP.READY);
  };

  const nextPhrase = () => {
    if (idx + 1 >= phrases.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setStep(STEP.LISTEN);
    setSpoken('');
    spokenRef.current = '';
    setResult(null);
  };

  const restart = () => {
    setIdx(0); setStep(STEP.LISTEN);
    setSpoken(''); spokenRef.current = '';
    setResult(null); setScores([]); setDone(false);
  };

  if (!pack || phrases.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ScreenHeader onBack={onBack} title="Shadow Mode" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: 24, textAlign: 'center' }}>
        No phrases available for this pack yet.
      </div>
    </div>
  );

  // ── Done screen ──────────────────────────────────────────────
  if (done) {
    const validScores = scores.filter(Boolean);
    const avg   = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length * 10) / 10 : 0;
    const emoji = avg >= 4.5 ? '🏆' : avg >= 3.5 ? '⭐' : avg >= 2.5 ? '👍' : '💪';
    const dotColors = { 5: 'var(--teal)', 4: '#4a8a18', 3: 'var(--gold)', 2: '#c97a1a', 1: 'var(--red)' };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <ScreenHeader onBack={onBack} title="Shadow Mode" sub="Session complete!" />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ fontSize: 70 }}>{emoji}</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink)' }}>{avg} / 5</div>
          <div style={{ fontSize: 14, color: 'var(--text-soft)', textAlign: 'center', lineHeight: 1.6 }}>
            Average pronunciation across {phrases.length} phrases
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {phrases.map((ph, i) => {
              const s = scores[i] || 0;
              return (
                <div key={i} style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 14, fontFamily: 'var(--font-jp)' }}>{ph.jp}</div>
                  <div style={{ width: 60 }}><ProgressBar value={(s / 5) * 100} color={dotColors[s] || 'var(--border)'} height={5} /></div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: dotColors[s] || 'var(--text-muted)', width: 20, textAlign: 'right' }}>{s || '–'}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button onClick={restart} style={{ flex: 1, background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>🔄 Again</button>
            <button onClick={onBack}  style={{ flex: 1, background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--text-soft)' }}>← Back</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main screen ──────────────────────────────────────────────
  const scoreColor = result
    ? ({ 5: 'var(--teal)', 4: '#4a8a18', 3: 'var(--gold)', 2: '#c97a1a', 1: 'var(--red)' }[result.score] || 'var(--text-muted)')
    : 'var(--text-muted)';
  const dotColors = { 5: 'var(--teal)', 4: '#4a8a18', 3: 'var(--gold)', 2: '#c97a1a', 1: 'var(--red)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: pack.color, color: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
          <button onClick={onBack} style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>←</button>
          <span style={{ fontSize: 18 }}>{pack.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Shadow Mode</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{pack.title} · {idx + 1} of {phrases.length}</div>
          </div>
          {/* Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Speed</span>
            {[{ v: 0.65, l: '🐢' }, { v: 0.85, l: '🚶' }, { v: 1.1, l: '🏃' }].map(s => (
              <button key={s.v} onClick={() => setSpeed(s.v)}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: speed === s.v ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '0 14px 12px' }}>
          <ProgressBar value={progress} color="rgba(255,255,255,0.5)" height={3} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Phrase card */}
        <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>Phrase {idx + 1}</div>
          <div style={{ fontSize: 26, fontFamily: 'var(--font-jp)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 8 }}>{current.jp}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 6 }}>{current.romaji}</div>
          <div style={{ fontSize: 14, color: 'var(--text-soft)', fontWeight: 500 }}>{current.en}</div>
        </div>

        {/* Status hint */}
        <div style={{ background: 'var(--mist)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          {step === STEP.LISTEN    && '① Listen carefully to the pronunciation'}
          {step === STEP.READY     && '② Repeat it out loud in Japanese!'}
          {step === STEP.RECORDING && '🎙️ Recording... tap Stop when done'}
          {step === STEP.SCORING   && '⏳ Analyzing your pronunciation...'}
          {step === STEP.RESULT    && (result?.feedback || '')}
        </div>

        {/* Result */}
        {step === STEP.RESULT && result && (
          <div style={{ background: '#fff', border: `1.5px solid ${scoreColor}40`, borderRadius: 'var(--radius)', padding: '16px', animation: 'fade-in 0.25s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 38 }}>
                {result.score === 5 ? '🏆' : result.score === 4 ? '⭐' : result.score === 3 ? '👍' : result.score === 2 ? '🔄' : '💪'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor }}>{result.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{result.feedback}</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: scoreColor }}>{result.score}/5</div>
            </div>
            {spokenText && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                You said: <span style={{ fontFamily: 'var(--font-jp)', color: 'var(--text)', fontWeight: 500 }}>{spokenText}</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step === STEP.LISTEN && (
            <button onClick={playPhrase} style={{ width: '100%', background: pack.color, color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '17px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              🔊 Play phrase
            </button>
          )}
          {step === STEP.READY && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={playPhrase} style={{ flex: 1, background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--text-soft)', fontWeight: 500 }}>🔊 Replay</button>
              <button onClick={startRecording} style={{ flex: 2, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', animation: 'pulse-ring 2s infinite' }}>🎙️ Speak now</button>
            </div>
          )}
          {step === STEP.RECORDING && (
            <button onClick={stopRecording} style={{ width: '100%', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '17px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', animation: 'pulse-ring 1s infinite' }}>⏹ Stop recording</button>
          )}
          {step === STEP.SCORING && (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 28, animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: 8 }}>⏳</div>
              <div style={{ fontSize: 14 }}>Scoring...</div>
            </div>
          )}
          {step === STEP.RESULT && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setStep(STEP.READY); setSpoken(''); spokenRef.current = ''; setResult(null); }}
                style={{ flex: 1, background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--text-soft)' }}>🔄 Try again</button>
              <button onClick={nextPhrase}
                style={{ flex: 2, background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                {idx + 1 < phrases.length ? 'Next →' : 'See results 🏆'}
              </button>
            </div>
          )}
        </div>

        {/* Dot nav */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingTop: 4 }}>
          {phrases.map((_, i) => {
            const s = scores[i];
            const bg = s ? (dotColors[s] || 'var(--border)') : (i === idx ? pack.color : 'var(--border)');
            return <div key={i} style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 10, background: bg, transition: 'all 0.25s' }} />;
          })}
        </div>

        {/* Auto-play toggle */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setAutoPlay(a => !a)}
            style={{ background: autoPlay ? 'var(--ink)' : 'var(--mist)', color: autoPlay ? '#fff' : 'var(--text-muted)', border: '0.5px solid var(--border)', borderRadius: 20, padding: '7px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            {autoPlay ? '🔊 Auto-play ON' : '🔇 Auto-play OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}
