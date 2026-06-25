import { useState } from 'react';
import { phrasePacks } from '../data/content';
import { speakJapanese } from '../utils/ai';
import { ScreenHeader, Badge, showToast } from '../components/UI';
import useStore from '../store/useStore';

export default function PhrasePacks({ onBack, onShadow }) {
  const [openPack, setOpenPack] = useState(null);
  const [search, setSearch]     = useState('');
  const { saveWord, isWordSaved, addXP } = useStore();

  const handleSave = (phrase) => {
    if (isWordSaved(phrase.jp)) { showToast('Already saved!'); return; }
    saveWord({ jp: phrase.jp, romaji: phrase.romaji, en: phrase.en });
    addXP(3);
    showToast('Saved to your word list! +3 XP', 'success');
  };

  // Search across all packs
  const searchResults = search.length > 1
    ? phrasePacks.flatMap(p => p.phrases.filter(ph =>
        ph.jp.includes(search) ||
        ph.en.toLowerCase().includes(search.toLowerCase()) ||
        ph?.romaji?.toLowerCase().includes(search.toLowerCase())
      ).map(ph => ({ ...ph, packId: p.id, packEmoji: p.emoji, packTitle: p.title }))
    )
    : [];

  if (openPack) {
    const pack = phrasePacks.find(p => p.id === openPack);
    return <PackDetail pack={pack} onBack={() => setOpenPack(null)} onShadow={onShadow} onSave={handleSave} isWordSaved={isWordSaved} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader onBack={onBack} title="Phrase Packs" sub="Real Japanese for real situations" />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
        {/* Search */}
        <div style={{ padding: '12px 16px 8px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search phrases across all packs..."
            style={{ width: '100%', border: '0.5px solid var(--border)', borderRadius: 12, padding: '11px 16px', fontSize: 16, outline: 'none', background: 'var(--mist)', fontFamily: 'var(--font-sans)' }}
          />
        </div>

        {/* Search results */}
        {search.length > 1 && (
          <div style={{ padding: '4px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{searchResults.length} results</div>
            {searchResults.length === 0
              ? <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>No phrases found for "{search}"</div>
              : searchResults.map((ph, i) => (
                <PhraseRow key={i} phrase={ph} onPlay={() => speakJapanese(ph.jp)} onSave={() => handleSave(ph)} saved={isWordSaved(ph.jp)}
                  tag={ph.packEmoji + ' ' + ph.packTitle} />
              ))
            }
          </div>
        )}

        {/* Pack grid */}
        {!search && (
          <>
            <div style={{ padding: '8px 16px 10px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Choose a pack to study. Tap 🔊 to hear, ☆ to save, then use <strong>Shadow Mode</strong> to practice speaking.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
              {phrasePacks.map(pack => (
                <div key={pack.id}
                  onClick={() => setOpenPack(pack.id)}
                  style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer' }}>
                  {/* Color band */}
                  <div style={{ height: 5, background: pack.color }} />
                  <div style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 50, height: 50, borderRadius: 12, background: pack.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                      {pack.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{pack.title}</div>
                        <Badge label={pack.level} />
                      </div>
                      <div style={{ fontSize: 12, fontFamily: 'var(--font-jp)', color: 'var(--text-muted)', marginBottom: 4 }}>{pack.titleJP}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{pack.desc}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 16, color: pack.color }}>{pack.phrases.length}</div>
                      <div>phrases</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '0.5px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 8 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setOpenPack(pack.id); }}
                      style={{ flex: 1, background: 'var(--mist)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '9px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--text-soft)', fontWeight: 500 }}>
                      📖 Study
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onShadow(pack.id); }}
                      style={{ flex: 1, background: pack.color, border: 'none', borderRadius: 8, padding: '9px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: '#fff', fontWeight: 600 }}>
                      🎤 Shadow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Pack detail (phrase list) ──────────────────────────────────
function PackDetail({ pack, onBack, onShadow, onSave, isWordSaved }) {
  const [active, setActive] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ background: pack.color, color: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px' }}>
          <button onClick={onBack} style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>←</button>
          <div style={{ fontSize: 24, flexShrink: 0 }}>{pack.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{pack.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-jp)' }}>{pack.titleJP} · {pack.phrases.length} phrases</div>
          </div>
        </div>
        <div style={{ padding: '0 16px 14px' }}>
          <button onClick={() => onShadow(pack.id)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 12, padding: '12px', fontSize: 14, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            🎤 Start Shadow Mode
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 24 }}>
        {pack.phrases.map((ph, i) => (
          <PhraseRow
            key={i}
            phrase={ph}
            expanded={active === i}
            onToggle={() => setActive(active === i ? null : i)}
            onPlay={() => speakJapanese(ph.jp)}
            onSave={() => onSave(ph)}
            saved={isWordSaved(ph.jp)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Single phrase row ─────────────────────────────────────────
function PhraseRow({ phrase, expanded, onToggle, onPlay, onSave, saved, tag }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {tag && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{tag}</div>}
          <div style={{ fontSize: 16, fontFamily: 'var(--font-jp)', fontWeight: 500, marginBottom: 3, lineHeight: 1.4 }}>{phrase.jp}</div>
          <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{phrase.en}</div>
        </div>
        <span style={{ fontSize: 14, color: 'var(--border)', flexShrink: 0, marginTop: 2 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ borderTop: '0.5px solid var(--border)', padding: '10px 14px', animation: 'fade-in 0.15s both' }}>
          <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: 6 }}>{phrase.romaji}</div>
          {phrase.note && (
            <div style={{ background: 'var(--gold-light)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text-soft)', marginBottom: 10, lineHeight: 1.6 }}>
              💡 {phrase.note}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onPlay}
              style={{ flex: 1, background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              🔊 Listen
            </button>
            <button onClick={onSave}
              style={{ flex: 1, background: saved ? 'var(--gold-light)' : 'var(--mist)', border: `0.5px solid ${saved ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: saved ? 'var(--gold)' : 'var(--text-soft)', fontWeight: 500 }}>
              {saved ? '★ Saved' : '☆ Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
