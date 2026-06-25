// ── AI conversation response ──────────────────────────────────
export async function getAIResponse(messages, scenario) {
  const systemPrompt = `You are a Japanese language conversation partner. Current scenario: "${scenario.name}" (${scenario.nameJP}). Level: ${scenario.level}.

${scenario.system}

CRITICAL RULES:
1. Always respond in natural Japanese appropriate for this scenario and level.
2. Keep responses SHORT — 1 to 2 sentences max. Real conversation turns are brief.
3. If the user makes a Japanese mistake, echo the correction naturally in your reply without explicitly saying "correction:".
4. ALWAYS format your reply EXACTLY like this, with no extra text before or after:
JP: [your Japanese response]
ROMAJI: [pronunciation in romaji]
EN: [English translation]`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.slice(-12),
      }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const raw  = data.content.map(c => c.text || '').join('');
    const jpMatch     = raw.match(/JP:\s*(.+)/);
    const romajiMatch = raw.match(/ROMAJI:\s*(.+)/);
    const enMatch     = raw.match(/EN:\s*(.+)/);
    return {
      jp:     jpMatch     ? jpMatch[1].trim()     : 'すみません、もう一度お願いします。',
      romaji: romajiMatch ? romajiMatch[1].trim() : '',
      en:     enMatch     ? enMatch[1].trim()     : 'Sorry, please try again.',
    };
  } catch {
    return {
      jp:     'すみません、少し問題がありました。もう一度試してください。',
      romaji: 'Sumimasen, sukoshi mondai ga arimashita. Mou ichido tameshite kudasai.',
      en:     'Sorry, there was a small issue. Please try again.',
    };
  }
}

// ── Pronunciation scoring ─────────────────────────────────────
export async function scorePronunciation(spokenText, expectedJP, expectedEN) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are a Japanese pronunciation coach.

Expected Japanese: ${expectedJP}
Expected meaning: ${expectedEN}
What the learner said (via speech recognition): ${spokenText}

Rate the pronunciation attempt. Speech recognition of Japanese is imperfect, so be lenient — focus on whether the key sounds/words came through.

Reply ONLY in this exact format (no extra text):
SCORE: [1-5]
LABEL: [Perfect / Great / Good / Try Again / Off Track]
FEEDBACK: [One short encouraging sentence in English, max 12 words]`,
        }],
      }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const raw  = data.content.map(c => c.text || '').join('');
    const scoreMatch    = raw.match(/SCORE:\s*(\d)/);
    const labelMatch    = raw.match(/LABEL:\s*(.+)/);
    const feedbackMatch = raw.match(/FEEDBACK:\s*(.+)/);
    return {
      score:    scoreMatch    ? parseInt(scoreMatch[1])    : 3,
      label:    labelMatch    ? labelMatch[1].trim()       : 'Good',
      feedback: feedbackMatch ? feedbackMatch[1].trim()    : 'Keep practicing!',
    };
  } catch {
    return { score: 3, label: 'Good', feedback: 'Keep practicing!' };
  }
}

// ── TTS ───────────────────────────────────────────────────────
export function speakJapanese(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u   = new SpeechSynthesisUtterance(text);
  u.lang    = 'ja-JP';
  u.rate    = rate;
  u.pitch   = 1;
  window.speechSynthesis.speak(u);
}

// ── Speech recognition ────────────────────────────────────────
export function startSpeechRecognition({ onResult, onEnd, onError, lang = 'ja-JP' }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError('Speech recognition not supported. Please use Chrome on Android or Safari on iOS.');
    return null;
  }
  const rec         = new SpeechRecognition();
  rec.lang          = lang;
  rec.interimResults = true;
  rec.continuous    = false;
  rec.onresult = e => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    onResult(final || interim, e.results[e.results.length - 1].isFinal);
  };
  rec.onend   = onEnd;
  rec.onerror = () => onError('Could not hear you clearly. Please try again.');
  rec.start();
  return rec;
}
