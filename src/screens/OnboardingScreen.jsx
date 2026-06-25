import { useState } from 'react';
import useStore from '../store/useStore';

const goals = [
  { id: 'conversation', emoji: '🗣️', label: 'Speak Conversationally', sub: 'Learn to chat naturally in everyday Japanese' },
  { id: 'jlpt',         emoji: '📝', label: 'Pass the JLPT Exam',     sub: 'Study for N5, N4, or N3 certification' },
  { id: 'both',         emoji: '🎯', label: 'Both',                   sub: 'Conversation practice + JLPT preparation' },
];
const levels = [
  { id: 'N5', label: 'N5 — Absolute Beginner', sub: 'I know very little or no Japanese' },
  { id: 'N4', label: 'N4 — Elementary',        sub: 'I know basic greetings and simple phrases' },
  { id: 'N3', label: 'N3 — Intermediate',      sub: 'I can handle everyday conversations' },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0); // 0=welcome 1=name 2=goal 3=level
  const [name, setName]       = useState('');
  const [goal, setGoal]       = useState('');
  const [level, setLevel]     = useState('');

  const finish = () => completeOnboarding({ userName: name.trim() || 'Learner', goalLevel: level, studyGoal: goal });

  /* ── Step 0: Welcome ── */
  if (step === 0) return (
    <div style={shell}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 20, animation: 'pop-in 0.5s both' }}>🇯🇵</div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-jp)', color: '#e8c96b', marginBottom: 6, letterSpacing: 2 }}>話し</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Hanashi</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 280, marginBottom: 48 }}>
          Your Japanese learning companion. Speak naturally with an AI partner and prepare for the JLPT exam.
        </div>
        <button onClick={() => setStep(1)} style={btn}>始めましょう！ Let's start →</button>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>Takes about 30 seconds to set up</div>
      </div>
    </div>
  );

  /* ── Step 1: Name ── */
  if (step === 1) return (
    <div style={shell}>
      <StepDots total={3} current={0} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 28px', gap: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>What should we call you?</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Your name or nickname</div>
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setStep(2)}
          placeholder="e.g. Irish, Mika..."
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: 12, padding: '16px 18px', fontSize: 16, color: '#fff',
            outline: 'none', width: '100%',
          }}
        />
        <div style={{ flex: 1 }} />
        <button onClick={() => setStep(2)} style={btn}>Next →</button>
      </div>
    </div>
  );

  /* ── Step 2: Goal ── */
  if (step === 2) return (
    <div style={shell}>
      <StepDots total={3} current={1} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 28px', gap: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>What's your goal{name ? `, ${name}` : ''}?</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>We'll tailor your experience to match</div>
        </div>
        {goals.map(g => (
          <div key={g.id} onClick={() => setGoal(g.id)}
            style={{
              background: goal === g.id ? 'rgba(232,201,107,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${goal === g.id ? '#e8c96b' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12, padding: '16px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start',
              transition: 'all 0.15s',
            }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{g.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: goal === g.id ? '#e8c96b' : '#fff', marginBottom: 3 }}>{g.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{g.sub}</div>
            </div>
            {goal === g.id && <span style={{ marginLeft: 'auto', fontSize: 18, color: '#e8c96b', flexShrink: 0 }}>✓</span>}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => goal && setStep(3)} style={{ ...btn, opacity: goal ? 1 : 0.4 }}>Next →</button>
      </div>
    </div>
  );

  /* ── Step 3: Level ── */
  return (
    <div style={shell}>
      <StepDots total={3} current={2} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 28px', gap: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>What's your current level?</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Be honest — you can always change it later</div>
        </div>
        {levels.map(l => (
          <div key={l.id} onClick={() => setLevel(l.id)}
            style={{
              background: level === l.id ? 'rgba(232,201,107,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${level === l.id ? '#e8c96b' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12, padding: '16px', cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: level === l.id ? '#e8c96b' : '#fff', marginBottom: 3 }}>{l.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{l.sub}</div>
            </div>
            {level === l.id && <span style={{ fontSize: 18, color: '#e8c96b', marginLeft: 12, flexShrink: 0 }}>✓</span>}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => level && finish()} style={{ ...btn, opacity: level ? 1 : 0.4 }}>
          Start Learning 🎌
        </button>
      </div>
    </div>
  );
}

function StepDots({ total, current }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '20px 0 8px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 8, height: 8, borderRadius: 10,
          background: i === current ? '#e8c96b' : 'rgba(255,255,255,0.2)',
          transition: 'all 0.25s',
        }} />
      ))}
    </div>
  );
}

const shell = {
  display: 'flex', flexDirection: 'column', flex: 1,
  background: 'var(--ink)', minHeight: '100dvh', minHeight: '100vh',
};
const btn = {
  background: '#e8c96b', color: 'var(--ink)', border: 'none', borderRadius: 14,
  padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  fontFamily: 'var(--font-sans)', width: '100%', transition: 'opacity 0.15s',
};
