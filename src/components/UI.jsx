import { useEffect, useState } from 'react';

// ── Toast ─────────────────────────────────────────────────────
let toastTimer = null;
let setToastFn = null;

export function Toast() {
  const [toast, setToast] = useState({ msg: '', show: false, type: 'default' });
  setToastFn = setToast;
  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(68px + var(--safe-bottom))',
      left: '50%',
      transform: 'translateX(-50%)',
      background: toast.type === 'success' ? 'var(--teal)' : toast.type === 'error' ? 'var(--red)' : 'var(--ink)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '20px',
      fontSize: '13px',
      zIndex: 9999,
      opacity: toast.show ? 1 : 0,
      transition: 'opacity 0.2s',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow-lg)',
      maxWidth: 'calc(100vw - 40px)',
      textAlign: 'center',
    }}>
      {toast.msg}
    </div>
  );
}

export function showToast(msg, type = 'default') {
  if (!setToastFn) return;
  clearTimeout(toastTimer);
  setToastFn({ msg, show: true, type });
  toastTimer = setTimeout(() => setToastFn(t => ({ ...t, show: false })), 2500);
}

// ── Badge ─────────────────────────────────────────────────────
const levelColors = {
  Beginner:     { bg: '#eaf3de', color: '#3b6d11' },
  Intermediate: { bg: '#faeeda', color: '#854f0b' },
  Advanced:     { bg: '#fbeaf0', color: '#993556' },
  N5: { bg: '#eaf3de', color: '#3b6d11' },
  N4: { bg: '#faeeda', color: '#854f0b' },
  N3: { bg: '#fbeaf0', color: '#993556' },
};

export function Badge({ label }) {
  const style = levelColors[label] || { bg: 'var(--mist-dark)', color: 'var(--text-soft)' };
  return (
    <span style={{
      fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px',
      background: style.bg, color: style.color, flexShrink: 0,
    }}>{label}</span>
  );
}

// ── ProgressBar ───────────────────────────────────────────────
export function ProgressBar({ value, color = 'var(--ink)', height = 4 }) {
  return (
    <div style={{ background: 'var(--border)', borderRadius: 20, height, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        background: color,
        borderRadius: 20,
        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );
}

// ── ScreenHeader ──────────────────────────────────────────────
export function ScreenHeader({ onBack, title, sub, right }) {
  return (
    <div style={{
      background: '#fff',
      borderBottom: '0.5px solid var(--border)',
      padding: '13px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
    }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            color: 'var(--text-muted)', fontSize: 22, display: 'flex', alignItems: 'center',
            padding: '0 6px 0 0', minWidth: 44, minHeight: 44, justifyContent: 'flex-start',
          }}
        >←</button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────
export function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)',
          animation: `bounce-dot 1.2s ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────
export function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase',
      color: 'var(--text-muted)', padding: '16px 16px 8px', ...style,
    }}>
      {children}
    </div>
  );
}

// ── XP Pill ───────────────────────────────────────────────────
export function XPPill({ amount }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: 'var(--gold-light)', color: 'var(--gold)',
      borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>+{amount} XP</span>
  );
}

// ── Casual mode warning badge ─────────────────────────────────
export function CasualBadge() {
  return (
    <span style={{
      fontSize: 10, background: '#fff3cd', color: '#856404',
      border: '1px solid #ffc107', borderRadius: 20,
      padding: '2px 8px', fontWeight: 500,
    }}>Casual Japanese</span>
  );
}
