import { useState, useRef, useEffect, useCallback } from 'react';
import { getAIResponse, speakJapanese, startSpeechRecognition } from '../utils/ai';
import { TypingDots, showToast } from '../components/UI';
import KeyboardGuide from '../components/KeyboardGuide';
import PronunciationScore from '../components/PronunciationScore';
import useStore from '../store/useStore';

export default function ChatScreen({ scenario, onBack }) {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [listening,   setListening]   = useState(false);
  const [showRomaji,  setShowRomaji]  = useState(true);
  const [showKbGuide, setShowKbGuide] = useState(false);
  const [scoreTarget, setScoreTarget] = useState(null); // { spokenText, jp, en }

  const messagesEndRef = useRef(null);
  const recRef         = useRef(null);
  const historyRef     = useRef([]);
  const loadingRef     = useRef(false);

  const {
    addXP, setChatHistory, getChatHistory, clearChatHistory,
    keyboardTipShown, markKeyboardTipShown,
    saveWord, isWordSaved,
  } = useStore();

  const isCasual = scenario.id === 'friends' || scenario.id === 'family';

  // Show keyboard guide on first ever chat open
  useEffect(() => {
    if (!keyboardTipShown) {
      const t = setTimeout(() => setShowKbGuide(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); recRef.current?.stop(); };
  }, []);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    const saved = getChatHistory(scenario.id);
    if (saved.length > 0) {
      setMessages(saved);
      historyRef.current = saved.map(m => ({ role: m.role, content: m.jp + (m.en ? `\n(${m.en})` : '') }));
    } else {
      const opening = { role: 'assistant', jp: scenario.opening.jp, romaji: scenario.opening.romaji, en: scenario.opening.en };
      setMessages([opening]);
      historyRef.current = [{ role: 'assistant', content: opening.jp + `\n(${opening.en})` }];
      speakJapanese(scenario.opening.jp);
    }
  }, [scenario.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = useCallback(async (text) => {
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setInput('');
    const userMsg = { role: 'user', jp: text };
    setMessages(prev => [...prev, userMsg]);
    historyRef.current.push({ role: 'user', content: text });
    const reply = await getAIResponse(historyRef.current, scenario);
    const aiMsg = { role: 'assistant', ...reply };
    historyRef.current.push({ role: 'assistant', content: reply.jp + `\n(${reply.en})` });
    setMessages(prev => { const next = [...prev, aiMsg]; setChatHistory(scenario.id, next); return next; });
    loadingRef.current = false;
    setLoading(false);
    addXP(5);
    speakJapanese(reply.jp);
  }, [scenario]);

  const toggleMic = () => {
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    recRef.current = startSpeechRecognition({
      onResult: (text, isFinal) => {
        setInput(text);
        if (isFinal) {
          recRef.current?.stop();
          setListening(false);
          if (text.trim()) {
            // If there's a last AI message, offer pronunciation scoring
            const lastAI = [...messages].reverse().find(m => m.role === 'assistant');
            if (lastAI) {
              setScoreTarget({ spokenText: text.trim(), jp: lastAI.jp, en: lastAI.en || '' });
            }
            send(text.trim());
          }
        }
      },
      onEnd: () => setListening(false),
      onError: (msg) => { showToast(msg, 'error'); setListening(false); },
    });
    setListening(true);
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    clearChatHistory(scenario.id);
    historyRef.current = [];
    const opening = { role: 'assistant', jp: scenario.opening.jp, romaji: scenario.opening.romaji, en: scenario.opening.en };
    setMessages([opening]);
    historyRef.current = [{ role: 'assistant', content: opening.jp + `\n(${opening.en})` }];
    speakJapanese(scenario.opening.jp);
  };

  const copyText = (text) => navigator.clipboard?.writeText(text).then(() => showToast('Copied!', 'success'));

  const handleSaveWord = (m, idx) => {
    if (!m.jp) return;
    if (isWordSaved(m.jp)) { showToast('Already saved!', 'default'); return; }
    saveWord({ jp: m.jp, romaji: m.romaji || '', en: m.en || '' });
    addXP(5);
    showToast('Word saved! ⭐ +5 XP', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid var(--border)', padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button onClick={onBack} style={{ fontSize: 22, color: 'var(--text-muted)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: scenario.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{scenario.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            {scenario.name}
            {isCasual && <span style={{ fontSize: 9, background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: 20, padding: '1px 6px', fontWeight: 600 }}>Casual</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-jp)' }}>{scenario.nameJP}</div>
        </div>
        <button onClick={() => setShowRomaji(r => !r)}
          style={{ fontSize: 10, background: showRomaji ? 'var(--ink)' : 'var(--mist-dark)', color: showRomaji ? '#fff' : 'var(--text-muted)', borderRadius: 20, padding: '6px 10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', minHeight: 32 }}>
          ロ字
        </button>
        <button onClick={() => setShowKbGuide(true)}
          style={{ fontSize: 18, color: 'var(--text-muted)', minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
          title="Japanese keyboard setup">⌨️</button>
        <button onClick={clearChat}
          style={{ fontSize: 18, color: 'var(--text-muted)', minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
          title="Restart conversation">↺</button>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}
  
      >
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, maxWidth: '90%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', animation: 'fade-in 0.22s both' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#e8c96b', flexShrink: 0, fontFamily: 'var(--font-jp)', fontWeight: 700, marginTop: 2 }}>話</div>
            )}
            {m.role === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0, fontWeight: 700, marginTop: 2 }}>Me</div>
            )}
            <div>
              <div
                style={{ background: m.role === 'user' ? 'var(--ink)' : '#fff', border: m.role === 'user' ? 'none' : '0.5px solid var(--border)', borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '10px 14px', wordBreak: 'break-word', cursor: 'pointer' }}
        
              >
                <div style={{ fontSize: 15, fontFamily: 'var(--font-jp)', fontWeight: 500, lineHeight: 1.65, color: m.role === 'user' ? '#fff' : 'var(--text)', marginBottom: m.en ? 3 : 0 }}>{m.jp}</div>
                {showRomaji && m.romaji && <div style={{ fontSize: 11, color: m.role === 'user' ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', marginBottom: 2, fontStyle: 'italic' }}>{m.romaji}</div>}
                {m.en && <div style={{ fontSize: 12, color: m.role === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--text-soft)' }}>{m.en}</div>}
              </div>

              {/* Action row under AI messages */}
              {m.role === 'assistant' && (
                <div style={{ display: 'flex', gap: 6, marginTop: 5, paddingLeft: 2 }}>
                  <button onClick={() => speakJapanese(m.jp)}
                    style={{ height: 30, background: '#fff', border: '0.5px solid var(--border)', borderRadius: 8, padding: '0 10px', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>🔊</button>
                  <button onClick={() => copyText(m.jp)}
                    style={{ height: 30, background: '#fff', border: '0.5px solid var(--border)', borderRadius: 8, padding: '0 10px', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>📋 Copy</button>
                  <button onClick={() => handleSaveWord(m, i)}
                    style={{ height: 30, background: isWordSaved(m.jp) ? 'var(--gold-light)' : '#fff', border: `0.5px solid ${isWordSaved(m.jp) ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 8, padding: '0 10px', cursor: 'pointer', fontSize: 12, color: isWordSaved(m.jp) ? 'var(--gold)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isWordSaved(m.jp) ? '★ Saved' : '☆ Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#e8c96b', fontFamily: 'var(--font-jp)', fontWeight: 700 }}>話</div>
            <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '10px 14px' }}><TypingDots /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div style={{ background: '#fff', borderTop: '0.5px solid var(--border)', padding: '10px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: listening ? 'var(--red)' : 'var(--text-muted)', textAlign: 'center', marginBottom: 8, fontWeight: listening ? 600 : 400, transition: 'color 0.2s' }}>
          {listening ? '🎙️ Listening... speak in Japanese' : 'Tap 🎙️ to speak · type in Japanese or English'}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Type in Japanese or English..."
            disabled={loading}
            style={{ flex: 1, border: '0.5px solid var(--border)', borderRadius: 22, padding: '11px 16px', fontSize: 16, outline: 'none', background: loading ? 'var(--mist-dark)' : 'var(--mist)', fontFamily: 'var(--font-sans)', transition: 'background 0.15s' }}
          />
          <button onClick={toggleMic} disabled={loading}
            style={{ width: 46, height: 46, borderRadius: '50%', background: listening ? 'var(--red)' : 'var(--ink)', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: listening ? 'pulse-ring 1s infinite' : 'none', opacity: loading ? 0.45 : 1, border: 'none', cursor: loading ? 'default' : 'pointer' }}>
            🎙️
          </button>
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--ink)', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', opacity: loading || !input.trim() ? 0.45 : 1 }}>
            →
          </button>
        </div>
      </div>

      {/* ── Overlays ── */}
      {showKbGuide && (
        <KeyboardGuide onClose={() => { setShowKbGuide(false); markKeyboardTipShown(); }} />
      )}
      {scoreTarget && (
        <PronunciationScore
          spokenText={scoreTarget.spokenText}
          expectedJP={scoreTarget.jp}
          expectedEN={scoreTarget.en}
          onDismiss={() => setScoreTarget(null)}
        />
      )}
    </div>
  );
}
