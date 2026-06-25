const tabs = [
  { id: 'home',         label: 'Home',   icon: '⌂'  },
  { id: 'conversation', label: 'Speak',  icon: '🗣'  },
  { id: 'jlpt',         label: 'JLPT',  icon: '📝'  },
  { id: 'packs',        label: 'Packs',  icon: '📦'  },
  { id: 'practice',     label: 'Drill',  icon: '⚡'  },
];

export default function BottomNav({ active, onNav }) {
  return (
    <nav style={{
      background: 'var(--ink)', display: 'flex',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky', bottom: 0, zIndex: 100, flexShrink: 0,
      paddingBottom: 'var(--safe-bottom)',
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onNav(t.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            minHeight: 56, padding: '8px 4px 6px', border: 'none', background: 'none',
            cursor: 'pointer', color: active === t.id ? '#e8c96b' : 'rgba(255,255,255,0.4)',
            fontSize: 10, letterSpacing: '0.3px', fontFamily: 'var(--font-sans)',
            transition: 'color 0.15s', WebkitTapHighlightColor: 'transparent',
          }}>
          <span style={{ fontSize: 20, lineHeight: 1.2 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
