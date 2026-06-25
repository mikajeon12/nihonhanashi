import { useState } from 'react';
import './index.css';
import BottomNav from './components/BottomNav';
import { Toast } from './components/UI';
import useStore from './store/useStore';

import OnboardingScreen   from './screens/OnboardingScreen';
import HomeScreen         from './screens/HomeScreen';
import ConversationScreen from './screens/ConversationScreen';
import ChatScreen         from './screens/ChatScreen';
import JLPTScreen         from './screens/JLPTScreen';
import VocabQuizScreen    from './screens/VocabQuizScreen';
import KanjiScreen        from './screens/KanjiScreen';
import GrammarScreen      from './screens/GrammarScreen';
import ListenScreen       from './screens/ListenScreen';
import PracticeScreen     from './screens/PracticeScreen';
import KanaScreen         from './screens/KanaScreen';
import SavedWordsScreen   from './screens/SavedWordsScreen';
import PhrasePacks        from './screens/PhrasePacks';
import ShadowingScreen    from './screens/ShadowingScreen';

import { scenarios } from './data/content';

export default function App() {
  const { hasOnboarded } = useStore();
  const [tab,        setTab]        = useState('home');
  const [screen,     setScreen]     = useState(null);
  const [screenData, setScreenData] = useState(null);

  if (!hasOnboarded) return <><OnboardingScreen /><Toast /></>;

  const navTo = (newTab) => { setTab(newTab); setScreen(null); setScreenData(null); };
  const back  = ()       => { setScreen(null); setScreenData(null); };

  const openScenario = (id) => {
    const found = scenarios.find(s => s.id === id);
    if (found) { setTab('conversation'); setScreen('chat'); setScreenData(found); }
  };

  const openSection = (level, section) => { setScreen(section); setScreenData({ level }); };

  const openShadow  = (packId) => { setScreen('shadow'); setScreenData({ packId }); };

  const renderScreen = () => {
    // ── Sub-screens ──
    if (screen === 'chat'    && screenData) return <ChatScreen      scenario={screenData}    onBack={back} />;
    if (screen === 'vocab'   && screenData) return <VocabQuizScreen level={screenData.level} onBack={back} />;
    if (screen === 'kanji'   && screenData) return <KanjiScreen     level={screenData.level} onBack={back} />;
    if (screen === 'grammar' && screenData) return <GrammarScreen   level={screenData.level} onBack={back} />;
    if (screen === 'listen'  && screenData) return <ListenScreen    level={screenData.level} onBack={back} />;
    if (screen === 'shadow'  && screenData) return <ShadowingScreen packId={screenData.packId} onBack={back} />;

    // ── Tab screens ──
    switch (tab) {
      case 'home':         return <HomeScreen         onNav={navTo} onOpenScenario={openScenario} onOpenShadow={openShadow} />;
      case 'conversation': return <ConversationScreen onBack={() => navTo('home')} onSelect={s => { setScreen('chat'); setScreenData(s); }} />;
      case 'jlpt':         return <JLPTScreen         onBack={() => navTo('home')} onSection={openSection} />;
      case 'practice':     return <PracticeScreen     onBack={() => navTo('home')} />;
      case 'packs':        return <PhrasePacks        onBack={() => navTo('home')} onShadow={openShadow} />;
      case 'kana':         return <KanaScreen         onBack={() => navTo('home')} />;
      case 'savedwords':   return <SavedWordsScreen   onBack={() => navTo('home')} />;
      default:             return <HomeScreen         onNav={navTo} onOpenScenario={openScenario} onOpenShadow={openShadow} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', height: '100vh', maxWidth: 430, margin: '0 auto', background: 'var(--mist)', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {renderScreen()}
      </div>
      {!screen && <BottomNav active={tab} onNav={navTo} />}
      <Toast />
    </div>
  );
}
