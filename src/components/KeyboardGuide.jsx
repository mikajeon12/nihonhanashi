import { useState } from 'react';
import useStore from '../store/useStore';

const steps = {
  ios: [
    { step: '1', title: 'Open Settings', desc: 'Go to Settings on your iPhone' },
    { step: '2', title: 'General → Keyboard', desc: 'Tap General, then Keyboards' },
    { step: '3', title: 'Add New Keyboard', desc: 'Tap "Add New Keyboard..."' },
    { step: '4', title: 'Select Japanese', desc: 'Scroll to 日本語 (Japanese) and tap it' },
    { step: '5', title: 'Choose Romaji', desc: 'Select "Romaji" — type Japanese using English letters!' },
    { step: '6', title: 'Switch keyboards', desc: 'In any app, tap the 🌐 globe icon on your keyboard to switch to Japanese' },
  ],
  android: [
    { step: '1', title: 'Open Settings', desc: 'Go to Settings on your Android phone' },
    { step: '2', title: 'System → Language', desc: 'Tap System, then Language & Input' },
    { step: '3', title: 'On-screen keyboard', desc: 'Tap "On-screen keyboard" or "Virtual keyboard"' },
    { step: '4', title: 'Gboard → Languages', desc: 'Tap Gboard, then Languages' },
    { step: '5', title: 'Add Japanese', desc: 'Tap "Add keyboard" and select 日本語 (Japanese)' },
    { step: '6', title: 'Switch keyboards', desc: 'Tap the 🌐 or language icon on Gboard to switch to Japanese' },
  ],
};

export default function KeyboardGuide({ onClose }) {
  const [os, setOs] = useState('ios');   // ← fixed: proper import, not require()
  const { markKeyboardTipShown } = useStore();

  const dismiss = () => {
    markKeyboardTipShown();
    onClose?.();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.7)', zIndex: 500, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={dismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, margin: '0 auto', padding: '8px 0 32px', maxHeight: '85dvh', overflowY: 'auto', animation: 'slide-up 0.3s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 10, margin: '12px auto 20px' }} />

        <div style={{ padding: '0 20px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>⌨️ Enable Japanese Keyboard</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Type Japanese directly in the chat! Set it up once and switch anytime with one tap.
          </div>

          {/* OS tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['ios', 'android'].map(o => (
              <button key={o} onClick={() => setOs(o)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer', background: os === o ? 'var(--ink)' : 'var(--mist)', color: os === o ? '#fff' : 'var(--text-muted)', border: os === o ? 'none' : '0.5px solid var(--border)', fontWeight: os === o ? 600 : 400 }}>
                {o === 'ios' ? '🍎 iPhone (iOS)' : '🤖 Android'}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {steps[os].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ink)', color: '#e8c96b', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div style={{ background: 'var(--teal-light)', border: '0.5px solid var(--teal)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', marginBottom: 4 }}>💡 Pro tip</div>
            <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6 }}>
              With the Japanese Romaji keyboard, type <strong>ta-be-ru</strong> and it suggests <span style={{ fontFamily: 'var(--font-jp)' }}>食べる</span> automatically. No need to memorize kana positions!
            </div>
          </div>

          <button onClick={dismiss}
            style={{ width: '100%', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 12, padding: '15px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Got it! Let's chat 🗣️
          </button>
        </div>
      </div>
    </div>
  );
}
