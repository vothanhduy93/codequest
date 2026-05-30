import React, { useState } from 'react';
import SkillTree from './SkillTree';
import Arena from './Arena';
import { ArrowLeft } from 'lucide-react';

export default function LearnTab() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [customAIChallenge, setCustomAIChallenge] = useState<any>(null);

  if (customAIChallenge) {
    return (
      <div className="relative h-full pt-12">
        <button 
          onClick={() => setCustomAIChallenge(null)}
          className="absolute top-0 left-0 bg-slate-800 text-white hover:bg-slate-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 z-50 shadow-lg transition-colors border border-slate-600"
        >
          <ArrowLeft size={16} /> Thoát AI Mode
        </button>
        <Arena kind="lesson" mode="learn" customChallenge={customAIChallenge} onChallengeComplete={() => setCustomAIChallenge(null)} />
      </div>
    );
  }

  if (selectedChallengeId) {
    return (
      <div className="relative h-full pt-12">
        <button 
          onClick={() => setSelectedChallengeId(null)}
          className="absolute top-0 left-0 bg-slate-800 text-white hover:bg-slate-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 z-50 shadow-lg transition-colors border border-slate-600"
        >
          <ArrowLeft size={16} /> Bản Đồ
        </button>
        <Arena kind="lesson" mode="learn" initialChallengeId={selectedChallengeId} />
      </div>
    );
  }

  return <SkillTree onSelectChallenge={(id) => setSelectedChallengeId(id)} onStartAIChallenge={(challenge) => setCustomAIChallenge(challenge)} />;
}
