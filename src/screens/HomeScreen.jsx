import useStore from '../store/useStore';
import { ProgressBar, SectionLabel } from '../components/UI';
import WordOfTheDay from '../components/WordOfTheDay';

const modules = [
  { id: 'conversation', emoji: '🗣️', label: 'Conversation', sub: 'Speak with AI partner',  accent: 'var(--red)'  },
  { id: 'packs',        emoji: '📦', label: 'Phrase Packs', sub: '6 packs · shadow mode',  accent: 'var(--ink)'  },
  { id: 'jlpt',         emoji: '📝', label: 'JLPT Prep',   sub: 'N3 · N4 · N5',            accent: 'var(--gold)' },
  { id: 'practice',     emoji: '⚡', label: 'Quick Drill', sub: 'Vocab flash cards',         accent: 'var(--teal)' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'おはようございます';
  if (h < 17) return 'こんにちは';
  return 'こんばんは';
}

export default function HomeScreen({ onNav, onOpenScenario, onOpenShadow }) {
  const { streak, xp, masteredVocab, userName, goalLevel, savedWords } = useStore();
  const n5done   = Object.keys(masteredVocab.N5).length;
  const n4done   = Object.keys(masteredVocab.N4).length;
  const n3done   = Object.keys(masteredVocab.N3).length;
  const goalDone = goalLevel === 'N3' ? n3done : goalLevel === 'N4' ? n4done : n5done;

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>

      {/* Hero */}
      <div style={{ background: 'var(--ink)', padding: '22px 20px 26px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -16, top: -12, fontSize: 110, color: 'rgba(232,201,107,0.06)', fontFamily: 'var(--font-jp)', fontWeight: 700, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>話</div>
        <div style={{ fontSize: 11, letterSpacing: '2.5px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 5 }}>
          {getGreeting()}{userName ? `, ${userName}` : ''}!
        </div>
        <div style={{ fontSize: 21, fontWeight: 600, marginBottom: 3 }}>Keep learning Japanese 🇯🇵</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>
          {streak > 0 ? `${streak}-day streak 🔥` : 'Start your streak today!'} · {xp} XP
        </div>
        <ProgressBar value={Math.round((goalDone / 20) * 100)} color="#e8c96b" height={5} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, marginBottom: 16 }}>
          {goalLevel} Vocabulary · {goalDone} / 20 words mastered
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Streak',  val: streak > 0 ? `${streak}🔥` : '0', nav: null },
            { label: 'XP',      val: xp,                                 nav: null },
            { label: 'Saved',   val: savedWords.length + ' words',       nav: 'savedwords' },
          ].map(s => (
            <div key={s.label}
              onClick={() => s.nav && onNav(s.nav)}
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px', cursor: s.nav ? 'pointer' : 'default' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#e8c96b' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Word of the Day */}
      <WordOfTheDay />

      {/* Shadow mode CTA */}
      <div style={{ margin: '14px 16px 0', background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        onClick={() => onOpenShadow('travel-japan')}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,201,107,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎤</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Shadow Mode</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Listen → Repeat → Get scored on pronunciation</div>
        </div>
        <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>→</span>
      </div>

      {/* Quick scenarios */}
      <SectionLabel>Practice scenarios</SectionLabel>
      <div style={{ display: 'flex', gap: 8, padding: '0 16px', overflowX: 'auto', paddingBottom: 6 }}>
        {[
          { id: 'cafe',       label: 'カフェ',     emoji: '☕' },
          { id: 'friends',    label: '友達と',     emoji: '👯' },
          { id: 'family',     label: '家族と',     emoji: '👨‍👩‍👧' },
          { id: 'restaurant', label: 'レストラン', emoji: '🍜' },
          { id: 'shopping',   label: '買い物',     emoji: '🛍️' },
          { id: 'doctor',     label: '病院で',     emoji: '🏥' },
        ].map(s => (
          <button key={s.id} onClick={() => onOpenScenario(s.id)}
            style={{ flexShrink: 0, background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, color: 'var(--text-soft)', minWidth: 62 }}>
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Modules */}
      <SectionLabel>Modules</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
        {modules.map(m => (
          <div key={m.id} onClick={() => onNav(m.id)}
            style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: m.accent, borderRadius: '12px 0 0 12px' }} />
            <div style={{ fontSize: 24, marginBottom: 10 }}>{m.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Kana + Saved shortcut row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '10px 16px 0' }}>
        {[
          { id: 'kana', emoji: 'あ', label: 'Kana Chart', sub: 'Hiragana · Katakana', bg: 'var(--mist-dark)' },
          { id: 'savedwords', emoji: '⭐', label: 'Saved Words', sub: `${savedWords.length} words saved`, bg: 'var(--gold-light)' },
        ].map(s => (
          <div key={s.id} onClick={() => onNav(s.id)}
            style={{ background: s.bg, border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, fontFamily: s.id === 'kana' ? 'var(--font-jp)' : 'inherit', fontWeight: s.id === 'kana' ? 700 : 400 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <SectionLabel>Did you know?</SectionLabel>
      <div style={{ margin: '0 16px 8px', background: 'var(--gold-light)', border: '0.5px solid #e6c86a', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>💡 Shadowing tip</div>
        <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.7 }}>
          Shadowing — repeating Japanese phrases immediately after hearing them — is one of the fastest ways to improve pronunciation. Try Shadow Mode in <strong>Phrase Packs</strong> daily for 5 minutes!
        </div>
      </div>
    </div>
  );
}
