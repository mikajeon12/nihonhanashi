import { scenarios } from '../data/content';
import { Badge, ScreenHeader } from '../components/UI';

export default function ConversationScreen({ onBack, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader
        onBack={onBack}
        title="Conversation"
        sub="Choose a scenario to practice"
        right={
          <span style={{
            background: 'var(--red-light)', color: 'var(--red)', borderRadius: 20,
            padding: '3px 10px', fontSize: 11, fontWeight: 500,
          }}>AI partner</span>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
        <div style={{ padding: '12px 16px 4px', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>
          Tap a scenario to start speaking Japanese. The AI will respond in Japanese with romaji + English. Use 🎙️ to speak!
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 16px' }}>
          {scenarios.map(s => (
            <div
              key={s.id}
              onClick={() => onSelect(s)}
              style={{
                background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)',
                padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                transition: 'border-color 0.12s',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: s.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
              }}>
                {s.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, fontFamily: 'var(--font-jp)' }}>{s.nameJP}</div>
              </div>
              <Badge label={s.level} />
              <span style={{ fontSize: 16, color: 'var(--border)', flexShrink: 0 }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
