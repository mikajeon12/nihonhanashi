import { useState } from 'react';
import { phrases } from '../data/content';
import { speakJapanese } from '../utils/ai';
import { ScreenHeader } from '../components/UI';

export default function PhrasesScreen({ onBack }) {
  const [active, setActive] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader onBack={onBack} title="Essential Phrases" sub="Tap any phrase to expand and listen" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '4px 0 8px' }}>
          These are the most useful phrases for everyday Japanese conversation. Tap 🔊 to hear the pronunciation.
        </div>
        {phrases.map((p, i) => (
          <div
            key={i}
            style={{
              background: '#fff', border: active === i ? '1.5px solid var(--ink)' : '0.5px solid var(--border)',
              borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s',
            }}
            onClick={() => setActive(active === i ? null : i)}
          >
            <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontFamily: 'var(--font-jp)', fontWeight: 500, marginBottom: 3 }}>{p.jp}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{p.romaji}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{p.en}</div>
              </div>
              <span style={{ fontSize: 14, color: 'var(--border)', marginLeft: 4 }}>{active === i ? '▲' : '▼'}</span>
            </div>

            {active === i && (
              <div style={{ borderTop: '0.5px solid var(--border)', padding: '12px 16px', animation: 'fade-in 0.2s both' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Example:</div>
                <div style={{ fontSize: 15, fontFamily: 'var(--font-jp)', marginBottom: 4 }}>{p.example}</div>
                <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 12 }}>{p.exampleEn}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); speakJapanese(p.jp); }}
                    style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                  >🔊 Phrase</button>
                  <button
                    onClick={e => { e.stopPropagation(); speakJapanese(p.example); }}
                    style={{ background: 'var(--mist)', color: 'var(--text-soft)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                  >🔊 Example</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
