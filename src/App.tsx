/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BackgroundStars } from './components/BackgroundStars';
import { CakeScene } from './components/CakeScene';
import { BirthdayMessageScene } from './components/BirthdayMessageScene';
import { MainWorld } from './components/MainWorld';
import { TimeCapsuleModal } from './components/TimeCapsuleModal';
import { MusicPlayer } from './components/MusicPlayer';
import { APP_CONTENT } from './data/content';
import { OpeningStage } from './types';

export default function App() {
  const [currentStage, setCurrentStage] = useState<OpeningStage>('candles_lit');
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState<boolean>(false);

  const handleWishCompleted = () => {
    setCurrentStage('birthday_message');
  };

  const handleContinueToWorld = () => {
    setCurrentStage('main_world');
  };

  const handleReplayCake = () => {
    setCurrentStage('candles_lit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#02101e] text-cyan-50 selection:bg-teal-400 selection:text-[#02101e]">
      {/* Universal atmospheric blue/turquoise starry background */}
      <BackgroundStars />

      {/* Main Orchestrated View */}
      <div className="relative z-10">
        {currentStage === 'candles_lit' && (
          <CakeScene
            recipientName={APP_CONTENT.recipientName}
            nickname={APP_CONTENT.nickname}
            onWishCompleted={handleWishCompleted}
          />
        )}

        {currentStage === 'birthday_message' && (
          <BirthdayMessageScene
            onContinue={handleContinueToWorld}
            onReplayCandles={handleReplayCake}
          />
        )}

        {currentStage === 'main_world' && (
          <MainWorld
            onReplayCake={handleReplayCake}
            onOpenTimeCapsule={() => setIsTimeCapsuleOpen(true)}
          />
        )}
      </div>

      {/* Interactive In-App Time Capsule Modal (8th June Website) */}
      <TimeCapsuleModal
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
      />

      {/* Persistent Independent Music Player (Accessible across all pages & stages without resetting) */}
      <MusicPlayer />
    </div>
  );
}
