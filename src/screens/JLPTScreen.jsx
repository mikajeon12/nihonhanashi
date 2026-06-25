import { ProgressBar } from '../components/UI';
import useStore from '../store/useStore';

const levels = [
  { id: 'N5', label: 'Beginner', desc: '~800 vocab · 80 kanji · Basic grammar', color: '#3b6d11', bg: '#eaf3de', vocabTotal: 20, kanjiTotal: 12, grammarTotal: 6 },
  { id: 'N4', label: 'Elementary', desc: '~1,500 vocab · 166 kanji · More patterns', color: '#854f0b', bg: '#faeeda', vocabTotal: 20, kanjiTotal: 5, grammarTotal: 6 },
  { id: 'N3', label: 'Intermediate', desc: '~3,750 vocab · 367 kanji · Complex sentences', color: '#993556', bg: '#fbeaf0', vocabTotal: 20, kanjiTotal: 5, grammarTotal: 5 },
];

export default function JLPTScreen({ onBack, onSection }) {
  const { masteredVocab, masteredKanji, masteredGrammar } = useStore();

  const countOf = (obj) => Object.keys(obj || {}).length;

  const n5pct = Math.round((countOf(masteredVocab.N5) / 20) * 100);
  const n4pct = Math.round((countOf(masteredVocab.N4) / 20) * 100);
  const isLocked = (id) => id === 'N4' ? n5pct < 50 : id === 'N3' ? n4pct < 50 : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Banner */}
      <div style={{ background: 'var(--ink)', color: '#fff', padding: '20px 20px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button onClick={onBack} style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>←</button>
          <span style={{ fontSize: 15, fontWeight: 500 }}>JLPT Preparation</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>
            日本語能力試験
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Vocab · Kanji · Grammar · Listening</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {levels.map(lv => {
          const locked = isLocked(lv.id);
          const vCount = countOf(masteredVocab[lv.id]);
          const kCount = countOf(masteredKanji[lv.id]);
          const gCount = countOf(masteredGrammar[lv.id]);
          const vPct = Math.round((vCount / lv.vocabTotal) * 100);
          const kPct = Math.round((kCount / lv.kanjiTotal) * 100);
          const gPct = Math.round((gCount / lv.grammarTotal) * 100);

          return (
            <div key={lv.id} style={{
              background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)',
              overflow: 'hidden', opacity: locked ? 0.55 : 1,
            }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 10, background: lv.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 700, color: lv.color, flexShrink: 0,
                }}>{lv.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{lv.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lv.desc}</div>
                </div>
                <span style={{ fontSize: 20 }}>{locked ? '🔒' : '›'}</span>
              </div>

              <div style={{ padding: '0 16px 14px' }}>
                <ProgressBar value={vPct} color={lv.color} />
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{locked ? `Unlock by completing 50% of ${lv.id === 'N4' ? 'N5' : 'N4'} vocab` : `${vPct}% vocab complete`}</span>
                  <span>{vCount} / {lv.vocabTotal}</span>
                </div>
              </div>

              {!locked && (
                <div style={{ borderTop: '0.5px solid var(--border)', display: 'flex' }}>
                  {[
                    { key: 'vocab', icon: '🗂️', label: 'Vocab', pct: vPct },
                    { key: 'kanji', icon: '字', label: 'Kanji', pct: kPct },
                    { key: 'grammar', icon: '📖', label: 'Grammar', pct: gPct },
                    { key: 'listen', icon: '👂', label: 'Listen', pct: 0 },
                  ].map((sec, i, arr) => (
                    <button
                      key={sec.key}
                      onClick={() => onSection(lv.id, sec.key)}
                      style={{
                        flex: 1, padding: '10px 4px', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 3,
                        borderRight: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
                        background: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)', transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--mist)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{
                        fontSize: sec.key === 'kanji' ? 15 : 17,
                        fontFamily: sec.key === 'kanji' ? 'var(--font-jp)' : 'inherit',
                        fontWeight: sec.key === 'kanji' ? 700 : 400,
                      }}>{sec.icon}</span>
                      {sec.label}
                      {sec.pct > 0 && <span style={{ fontSize: 9, color: lv.color }}>{sec.pct}%</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ background: 'var(--gold-light)', border: '0.5px solid #e6c86a', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>📋 About the JLPT</div>
          <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.7 }}>
            The Japanese Language Proficiency Test (日本語能力試験) is held twice a year in July and December.
            N5 is the easiest level; N1 is the hardest. This app covers N5, N4, and N3.
          </div>
        </div>
      </div>
    </div>
  );
}
