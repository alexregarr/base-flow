/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Info, Share2, Wallet } from 'lucide-react';

// Base Builder Code for attribution (example)
// In a real app, you'd get this from Base
const BUILDER_CODE = "0x420"; 

export default function App() {
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [history, setHistory] = useState<{ id: number; value: number; time: string; type?: 'flow' | 'checkin' }[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const requestRef = useRef<number>(null);

  // Load state from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('base_flow_history');
    const savedCheckIn = localStorage.getItem('base_flow_last_checkin');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedCheckIn) setLastCheckIn(savedCheckIn);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('base_flow_history', JSON.stringify(history));
    localStorage.setItem('base_flow_last_checkin', lastCheckIn || '');
  }, [history, lastCheckIn]);

  const handleStart = () => setIsCharging(true);
  const handleEnd = () => {
    if (isCharging && power > 0) {
      const newEntry = {
        id: Date.now(),
        value: Math.floor(power),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'flow' as const
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5));
    }
    setIsCharging(false);
    setPower(0);
  };

  const handleCheckIn = async () => {
    if (isCheckingIn || lastCheckIn === new Date().toDateString()) return;

    setIsCheckingIn(true);
    
    // Simulate Blockchain Transaction
    // In a real app, you would use useWriteContract from wagmi here
    await new Promise(resolve => setTimeout(resolve, 2500));

    const newEntry = {
      id: Date.now(),
      value: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'checkin' as const
    };

    setHistory(prev => [newEntry, ...prev].slice(0, 5));
    setLastCheckIn(new Date().toDateString());
    setIsCheckingIn(false);
  };

  const update = useCallback(() => {
    if (isCharging) {
      setPower(prev => Math.min(prev + 0.5, 100));
    }
    requestRef.current = requestAnimationFrame(update);
  }, [isCharging]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-8 font-sans selection:bg-blue-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: `radial-gradient(circle, var(--accent) 0%, transparent 70%)`,
            transform: `translate(-50%, -50%) scale(${1 + power / 100})`
          }}
        />
      </div>

      {/* Header */}
      <header className="z-10 w-full max-w-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="font-medium tracking-tight text-white/90">Base Flow</span>
        </div>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
        >
          <Info size={20} />
        </button>
      </header>

      {/* Main Experience */}
      <main className="z-10 flex flex-col items-center justify-center flex-1 w-full">
        <div className="relative group">
          {/* Outer Ring */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-white/10"
            animate={{ scale: isCharging ? 1.2 : 1, opacity: isCharging ? 0.5 : 0.2 }}
          />
          
          {/* Interaction Core */}
          <motion.button
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            className="relative w-48 h-48 rounded-full glass-panel flex flex-col items-center justify-center gap-2 cursor-none select-none active:scale-95 transition-transform duration-75"
            whileHover={{ scale: 1.02 }}
          >
            <AnimatePresence mode="wait">
              {!isCharging ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <Zap size={32} className="text-white/20 mb-2" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Hold to Flow</span>
                </motion.div>
              ) : (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-5xl font-light tracking-tighter tabular-nums">
                    {Math.floor(power)}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#0052FF] font-bold">Charging</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="96"
                cy="96"
                r="92"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={2 * Math.PI * 92}
                strokeDashoffset={2 * Math.PI * 92 * (1 - power / 100)}
                className="text-[#0052FF] transition-all duration-150 ease-linear"
              />
            </svg>
          </motion.button>
        </div>

        {/* Status Indicator */}
        <div className="mt-12 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-white/30 text-[11px] uppercase tracking-widest font-medium">
            <Shield size={12} />
            <span>Builder Code Active: {BUILDER_CODE}</span>
          </div>
          <div className="h-[1px] w-12 bg-white/10 mt-4" />
        </div>
      </main>

      {/* Footer / History */}
      <footer className="z-10 w-full max-w-md space-y-4">
        {/* Daily Check-in Card */}
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between overflow-hidden relative">
          <div className="flex flex-col gap-1">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Daily Ritual</h3>
            <p className="text-sm font-medium text-white/90">
              {lastCheckIn === new Date().toDateString() ? 'Ritual Complete' : 'Onchain Check-in'}
            </p>
          </div>
          
          <button 
            onClick={handleCheckIn}
            disabled={isCheckingIn || lastCheckIn === new Date().toDateString()}
            className={`relative px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
              lastCheckIn === new Date().toDateString() 
                ? 'bg-white/5 text-white/20 cursor-default' 
                : 'bg-[#0052FF] text-white hover:shadow-[0_0_20px_rgba(0,82,255,0.4)] active:scale-95'
            }`}
          >
            {isCheckingIn ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Zap size={14} />
              </motion.div>
            ) : lastCheckIn === new Date().toDateString() ? (
              'Done'
            ) : (
              'Check-in'
            )}
          </button>

          {/* Transaction Progress Bar (Simulated) */}
          {isCheckingIn && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 h-[2px] bg-[#0052FF] w-full"
            />
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-white/40 font-bold">Recent Activity</h3>
            <Wallet size={14} className="text-white/20" />
          </div>
          
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-white/20 italic py-2">No activity recorded yet...</p>
            ) : (
              history.map((entry) => (
                <motion.div 
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${entry.type === 'checkin' ? 'bg-emerald-500' : 'bg-[#0052FF]'}`} />
                    <span className="text-sm font-medium text-white/80">
                      {entry.type === 'checkin' ? 'Daily Check-in' : `+${entry.value} Flow`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/30">{entry.time}</span>
                </motion.div>
              ))
            )}
          </div>

          <button className="mt-2 w-full py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
            <Share2 size={14} />
            Share Essence
          </button>
        </div>
      </footer>

      {/* Info Overlay */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setShowInfo(false)}
          >
            <div className="max-w-sm text-center space-y-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-light tracking-tight">About Base Flow</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Base Flow is a minimalist generative experience designed for the Base ecosystem. 
                It demonstrates the "Expensive Minimalism" aesthetic, focusing on fluid motion 
                and high-fidelity interactions.
              </p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Developer Note</p>
                <p className="text-xs text-white/70">
                  This app is optimized for the Base App container. It includes attribution logic 
                  via Builder Codes to support the ecosystem.
                </p>
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-xs uppercase tracking-widest font-bold text-[#0052FF] hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
