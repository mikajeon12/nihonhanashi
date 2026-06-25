import { useState } from 'react';
import { speakJapanese } from '../utils/ai';
import { ScreenHeader } from '../components/UI';

const hiragana = [
  { r:'a',  h:'あ',k:'ア' }, { r:'i',  h:'い',k:'イ' }, { r:'u',  h:'う',k:'ウ' }, { r:'e',  h:'え',k:'エ' }, { r:'o',  h:'お',k:'オ' },
  { r:'ka', h:'か',k:'カ' }, { r:'ki', h:'き',k:'キ' }, { r:'ku', h:'く',k:'ク' }, { r:'ke', h:'け',k:'ケ' }, { r:'ko', h:'こ',k:'コ' },
  { r:'sa', h:'さ',k:'サ' }, { r:'shi',h:'し',k:'シ' }, { r:'su', h:'す',k:'ス' }, { r:'se', h:'せ',k:'セ' }, { r:'so', h:'そ',k:'ソ' },
  { r:'ta', h:'た',k:'タ' }, { r:'chi',h:'ち',k:'チ' }, { r:'tsu',h:'つ',k:'ツ' }, { r:'te', h:'て',k:'テ' }, { r:'to', h:'と',k:'ト' },
  { r:'na', h:'な',k:'ナ' }, { r:'ni', h:'に',k:'ニ' }, { r:'nu', h:'ぬ',k:'ヌ' }, { r:'ne', h:'ね',k:'ネ' }, { r:'no', h:'の',k:'ノ' },
  { r:'ha', h:'は',k:'ハ' }, { r:'hi', h:'ひ',k:'ヒ' }, { r:'fu', h:'ふ',k:'フ' }, { r:'he', h:'へ',k:'ヘ' }, { r:'ho', h:'ほ',k:'ホ' },
  { r:'ma', h:'ま',k:'マ' }, { r:'mi', h:'み',k:'ミ' }, { r:'mu', h:'む',k:'ム' }, { r:'me', h:'め',k:'メ' }, { r:'mo', h:'も',k:'モ' },
  { r:'ya', h:'や',k:'ヤ' }, { r:'—',  h:'',  k:''   }, { r:'yu', h:'ゆ',k:'ユ' }, { r:'—',  h:'',  k:''  }, { r:'yo', h:'よ',k:'ヨ' },
  { r:'ra', h:'ら',k:'ラ' }, { r:'ri', h:'り',k:'リ' }, { r:'ru', h:'る',k:'ル' }, { r:'re', h:'れ',k:'レ' }, { r:'ro', h:'ろ',k:'ロ' },
  { r:'wa', h:'わ',k:'ワ' }, { r:'—',  h:'',  k:''   }, { r:'—',  h:'',  k:''  }, { r:'—',  h:'',  k:''  }, { r:'wo', h:'を',k:'ヲ' },
  { r:'n',  h:'ん',k:'ン' },
];

const specialKana = [
  { r:'ga',h:'が',k:'ガ'},{r:'gi',h:'ぎ',k:'ギ'},{r:'gu',h:'ぐ',k:'グ'},{r:'ge',h:'げ',k:'ゲ'},{r:'go',h:'ご',k:'ゴ'},
  { r:'za',h:'ざ',k:'ザ'},{r:'ji',h:'じ',k:'ジ'},{r:'zu',h:'ず',k:'ズ'},{r:'ze',h:'ぜ',k:'ゼ'},{r:'zo',h:'ぞ',k:'ゾ'},
  { r:'da',h:'だ',k:'ダ'},{r:'di',h:'ぢ',k:'ヂ'},{r:'du',h:'づ',k:'ヅ'},{r:'de',h:'で',k:'デ'},{r:'do',h:'ど',k:'ド'},
  { r:'ba',h:'ば',k:'バ'},{r:'bi',h:'び',k:'ビ'},{r:'bu',h:'ぶ',k:'ブ'},{r:'be',h:'べ',k:'ベ'},{r:'bo',h:'ぼ',k:'ボ'},
  { r:'pa',h:'ぱ',k:'パ'},{r:'pi',h:'ぴ',k:'ピ'},{r:'pu',h:'ぷ',k:'プ'},{r:'pe',h:'ぺ',k:'ペ'},{r:'po',h:'ぽ',k:'ポ'},
];

export default function KanaScreen({ onBack }) {
  const [mode, setMode] = useState('hiragana'); // 'hiragana' | 'katakana'
  const [showRomaji, setShowRomaji] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizInput, setQuizInput] = useState('');
  const [quizResult, setQuizResult] = useState(null); // null | 'correct' | 'wrong'
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);

  const allKana = [...hiragana.filter(k => k.h), ...specialKana];
  const quizPool = allKana.filter(k => k.h && k.r !== '—');
  const current = quizPool[quizIdx % quizPool.length];

  const checkAnswer = () => {
    const ans = quizInput.trim().toLowerCase();
    const correct = ans === current.r;
    setQuizResult(correct ? 'correct' : 'wrong');
    setQuizTotal(t => t + 1);
    if (correct) setQuizScore(s => s + 1);
    setTimeout(() => {
      setQuizInput('');
      setQuizResult(null);
      setQuizIdx(i => i + 1);
    }, 900);
  };

  if (quizMode) return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader
        onBack={() => setQuizMode(false)}
        title="Kana Quiz"
        sub={`${quizScore} correct · ${quizTotal} answered`}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['hiragana','katakana'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer', background: mode === m ? 'var(--ink)' : 'var(--mist)', color: mode === m ? '#fff' : 'var(--text-muted)', border: mode === m ? 'none' : '0.5px solid var(--border)', fontWeight: mode === m ? 500 : 400 }}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div style={{
          width: 140, height: 140, background: '#fff', border: '0.5px solid var(--border)', borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80, fontFamily: 'var(--font-jp)', fontWeight: 500,
          boxShadow: 'var(--shadow)',
          color: quizResult === 'correct' ? 'var(--teal)' : quizResult === 'wrong' ? 'var(--red)' : 'var(--ink)',
          transition: 'color 0.2s',
        }}>
          {mode === 'hiragana' ? current.h : current.k}
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Type the romaji for this character</div>

        <input
          value={quizInput}
          onChange={e => setQuizInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && quizInput.trim()) checkAnswer(); }}
          placeholder="e.g. ka, shi, tsu..."
          autoFocus
          style={{
            width: '100%', border: `2px solid ${quizResult === 'correct' ? 'var(--teal)' : quizResult === 'wrong' ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 12, padding: '14px 16px', fontSize: 16, outline: 'none',
            textAlign: 'center', fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s',
            background: quizResult === 'correct' ? 'var(--teal-light)' : quizResult === 'wrong' ? 'var(--red-light)' : '#fff',
          }}
        />

        {quizResult === 'wrong' && (
          <div style={{ fontSize: 14, color: 'var(--red)', fontWeight: 500 }}>
            Answer: <strong>{current.r}</strong>
          </div>
        )}

        <button onClick={checkAnswer} disabled={!quizInput.trim() || !!quizResult}
          style={{ background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 36px', fontSize: 15, fontWeight: 600, cursor: quizInput.trim() && !quizResult ? 'pointer' : 'default', opacity: quizInput.trim() && !quizResult ? 1 : 0.4, fontFamily: 'var(--font-sans)' }}>
          Check ✓
        </button>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>{quizScore}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Correct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{quizTotal}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>
              {quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <ScreenHeader
        onBack={onBack}
        title="Kana Chart"
        sub="Hiragana & Katakana reference"
        right={
          <button onClick={() => setShowRomaji(r => !r)}
            style={{ fontSize: 11, background: showRomaji ? 'var(--ink)' : 'var(--mist-dark)', color: showRomaji ? '#fff' : 'var(--text-muted)', borderRadius: 20, padding: '5px 12px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
            ローマ字
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
          {['hiragana','katakana'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer', background: mode === m ? 'var(--ink)' : '#fff', color: mode === m ? '#fff' : 'var(--text-muted)', border: mode === m ? 'none' : '0.5px solid var(--border)', fontWeight: mode === m ? 600 : 400 }}>
              {m === 'hiragana' ? 'Hiragana (ひらがな)' : 'Katakana (カタカナ)'}
            </button>
          ))}
        </div>

        {/* Basic kana grid */}
        <div style={{ padding: '0 16px', marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Basic ({mode === 'hiragana' ? 'ひらがな' : 'カタカナ'})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {hiragana.map((k, i) => {
              const char = mode === 'hiragana' ? k.h : k.k;
              if (!char || k.r === '—') return <div key={i} />;
              return (
                <div key={i} onClick={() => speakJapanese(char)}
                  style={{
                    background: '#fff', border: '0.5px solid var(--border)', borderRadius: 10,
                    padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    cursor: 'pointer', transition: 'background 0.1s', minHeight: 56,
                  }}
                  onTouchStart={e => e.currentTarget.style.background = 'var(--mist-dark)'}
                  onTouchEnd={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ fontSize: 22, fontFamily: 'var(--font-jp)', lineHeight: 1 }}>{char}</span>
                  {showRomaji && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{k.r}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dakuten/Handakuten */}
        <div style={{ padding: '12px 16px', marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Voiced & Semi-voiced (゛゜)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {specialKana.map((k, i) => {
              const char = mode === 'hiragana' ? k.h : k.k;
              return (
                <div key={i} onClick={() => speakJapanese(char)}
                  style={{ background: 'var(--gold-light)', border: '0.5px solid #e6c86a', borderRadius: 10, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', minHeight: 56 }}
                  onTouchStart={e => e.currentTarget.style.background = '#f5e8b0'}
                  onTouchEnd={e => e.currentTarget.style.background = 'var(--gold-light)'}
                >
                  <span style={{ fontSize: 22, fontFamily: 'var(--font-jp)', lineHeight: 1 }}>{char}</span>
                  {showRomaji && <span style={{ fontSize: 10, color: 'var(--gold)' }}>{k.r}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        <div style={{ margin: '0 16px 12px', background: 'var(--teal-light)', border: '0.5px solid var(--teal)', borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', marginBottom: 4 }}>💡 Tip</div>
          <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6 }}>
            Tap any character to hear it spoken. Hiragana is used for native Japanese words. Katakana is used for foreign words and names (e.g. コーヒー = coffee).
          </div>
        </div>

        {/* Quiz CTA */}
        <div style={{ padding: '0 16px' }}>
          <button onClick={() => { setQuizMode(true); setQuizScore(0); setQuizTotal(0); setQuizIdx(0); }}
            style={{ width: '100%', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            ⚡ Practice with Kana Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
