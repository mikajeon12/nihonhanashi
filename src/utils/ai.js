const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY || ''}`;

async function callGemini(prompt, maxTokens = 300) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function getAIResponse(messages, scenario) {
  const history = messages
    .slice(-12)
    .map(m => `${m.role === 'user' ? 'Learner' : 'AI Partner'}: ${m.content}`)
    .join('\n');

  const prompt = `You are a Japanese language conversation partner.
Scenario: "${scenario.name}" (${scenario.nameJP}). Level: ${scenario.level}.
${scenario.system}

Conversation so far:
${history}

RULES:
1. Respond in natural Japanese for this scenario and level.
2. Keep it SHORT — 1 to 2 sentences max.
3. Gently correct mistakes by echoing the correct form naturally.
4. Reply EXACTLY in this format, nothing else:
JP: [Japanese response]
ROMAJI: [romaji pronunciation]
EN: [English translation]`;

  try {
    const raw = await callGemini(prompt, 300);
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

export async function scorePronunciation(spokenText, expectedJP, expectedEN) {
  const prompt = `You are a Japanese pronunciation coach.
Expected Japanese: ${expectedJP}
Expected meaning: ${expectedEN}
Learner said: ${spokenText}

Be lenient — speech recognition of Japanese is imperfect.

Reply ONLY in this format:
SCORE: [1-5]
LABEL: [Perfect / Great / Good / Try Again / Off Track]
FEEDBACK: [One short encouraging sentence, max 12 words]`;

  try {
    const raw = await callGemini(prompt, 150);
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

export function speakJapanese(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP'; u.rate = rate; u.pitch = 1;
  window.speechSynthesis.speak(u);
}

export function startSpeechRecognition({ onResult, onEnd, onError, lang = 'ja-JP' }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { onError('Speech recognition not supported. Please use Chrome or Safari.'); return null; }
  const rec = new SR();
  rec.lang = lang; rec.interimResults = true; rec.continuous = false;
  rec.onresult = e => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    onResult(final || interim, e.results[e.results.length - 1].isFinal);
  };
  rec.onend = onEnd;
  rec.onerror = () => onError('Could not hear you clearly. Please try again.');
  rec.start();
  return rec;
}
