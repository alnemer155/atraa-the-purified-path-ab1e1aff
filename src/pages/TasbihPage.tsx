import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Vibrate, Volume2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTasbihState } from '@/lib/user';

const tasbihatZahra = [
  { text: 'الله اكبر', target: 34 },
  { text: 'الحمد لله', target: 33 },
  { text: 'سبحان الله', target: 33 },
];
];

type TasbihMode = 'zahra' | 'open';

function playTasbihSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

const TasbihPage = () => {
  const [mode, setMode] = useState<TasbihMode>('zahra');
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [openCount, setOpenCount] = useState(() => {
    const saved = localStorage.getItem('atraa_open_tasbih');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [vibration, setVibration] = useState(() => localStorage.getItem('atraa_tasbih_vibrate') !== 'false');
  const [sound, setSound] = useState(() => localStorage.getItem('atraa_tasbih_sound') === 'true');
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => { localStorage.setItem('atraa_open_tasbih', String(openCount)); }, [openCount]);

  useEffect(() => {
    const totalDone = tasbihatZahra.slice(0, step).reduce((s, t) => s + t.target, 0) + count;
    if (totalDone > 0 || openCount > 0) {
      saveTasbihState({ mode, step, count, openCount, timestamp: Date.now() });
    }
  }, [mode, step, count, openCount]);

  const current = tasbihatZahra[step];
  const totalAll = tasbihatZahra.reduce((s, t) => s + t.target, 0);
  const totalDone = tasbihatZahra.slice(0, step).reduce((s, t) => s + t.target, 0) + count;

  const doFeedback = useCallback(() => {
    if (vibration && navigator.vibrate) navigator.vibrate(15);
    if (sound) playTasbihSound();
  }, [vibration, sound]);

  const triggerPulse = useCallback(() => {
    setShowPulse(true);
    setTimeout(() => setShowPulse(false), 300);
  }, []);

  const handleTapZahra = useCallback(() => {
    doFeedback();
    triggerPulse();
    if (count + 1 >= current.target) {
      if (step + 1 < tasbihatZahra.length) { setStep(step + 1); setCount(0); }
      else { setCount(current.target); }
    } else { setCount(c => c + 1); }
  }, [count, step, current, doFeedback, triggerPulse]);

  const handleTapOpen = useCallback(() => {
    doFeedback();
    triggerPulse();
    setOpenCount(c => c + 1);
  }, [doFeedback, triggerPulse]);

  const handleReset = () => { setStep(0); setCount(0); if (mode === 'open') setOpenCount(0); };
  const toggleVibration = () => { const n = !vibration; setVibration(n); localStorage.setItem('atraa_tasbih_vibrate', String(n)); };
  const toggleSound = () => { const n = !sound; setSound(n); localStorage.setItem('atraa_tasbih_sound', String(n)); };

  const isComplete = mode === 'zahra' && step === tasbihatZahra.length - 1 && count >= current.target;

  const handleScreenTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'open') return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-control]')) return;
    handleTapOpen();
  }, [mode, handleTapOpen]);

  return (
    <div
      className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col select-none"
      onClick={mode === 'open' ? handleScreenTap : undefined}
    >
      {/* Mode selector */}
      <div className="flex gap-2 mb-5" data-control>
        {[
          { key: 'zahra' as const, label: 'تسبيح الزهراء ❁', desc: '١٠٠ تسبيحة' },
          { key: 'open' as const, label: 'تسبيح حر', desc: 'بلا حدود' },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setStep(0); setCount(0); }}
            className={`flex-1 py-3.5 px-3 rounded-2xl text-center transition-all active:scale-[0.97] ${
              mode === m.key
                ? 'islamic-gradient text-primary-foreground shadow-lg shadow-primary/15'
                : 'bg-card/80 backdrop-blur-sm border border-border/30 text-foreground hover:border-primary/25'
            }`}
          >
            <span className="text-[13px] font-bold block">{m.label}</span>
            <span className={`text-[9px] font-medium block mt-0.5 ${mode === m.key ? 'text-primary-foreground/60' : 'text-muted-foreground/50'}`}>{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-3 px-1" data-control>
        <button onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all active:scale-95">
          <RotateCcw className="w-3.5 h-3.5" /> إعادة
        </button>
        <div className="flex items-center gap-1.5">
          <button onClick={toggleVibration}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${vibration ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground/40 hover:bg-secondary/50'}`}>
            <Vibrate className="w-4 h-4" />
          </button>
          <button onClick={toggleSound}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${sound ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground/40 hover:bg-secondary/50'}`}>
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <AnimatePresence mode="wait">
          {mode === 'zahra' ? (
            <motion.div key="zahra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
              {/* Step indicators */}
              <div className="flex gap-4 mb-6 w-full max-w-[300px]">
                {tasbihatZahra.map((t, i) => {
                  const isDone = i < step || (i === step && isComplete);
                  const isCurrent = i === step && !isComplete;
                  return (
                    <div key={i} className="flex-1 text-center">
                      <div className={`mx-auto w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold mb-2 transition-all ${
                        isDone ? 'islamic-gradient text-primary-foreground shadow-lg shadow-primary/15'
                          : isCurrent ? 'bg-primary/10 text-primary border-2 border-primary/50 shadow-sm'
                          : 'bg-secondary/40 text-muted-foreground/50'
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <p className={`text-[11px] font-semibold ${isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground/50'}`}>{t.text}</p>
                      <p className={`text-[9px] mt-0.5 ${isCurrent ? 'text-primary/60' : 'text-muted-foreground/30'}`}>{t.target}×</p>
                    </div>
                  );
                })}
              </div>

              {/* Overall progress */}
              <div className="w-full max-w-[300px] mb-8">
                <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                  <motion.div className="h-full rounded-full islamic-gradient" animate={{ width: `${(totalDone / totalAll) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[9px] text-muted-foreground/40 font-medium">{totalDone} / {totalAll}</span>
                  <span className="text-[9px] text-primary/50 font-bold">{Math.round((totalDone / totalAll) * 100)}%</span>
                </div>
              </div>

              {isComplete ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                  <div className="w-24 h-24 mx-auto mb-5 rounded-3xl islamic-gradient flex items-center justify-center shadow-xl shadow-primary/20">
                    <Check className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1.5">تم بحمد الله ✦</p>
                  <p className="text-sm text-muted-foreground font-medium">{totalAll} تسبيحة</p>
                </motion.div>
              ) : (
                <>
                  <motion.p key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-primary mb-8 tracking-tight">
                    {current.text}
                  </motion.p>

                  {/* Counter ring */}
                  <div className="relative mb-6">
                    {showPulse && (
                      <motion.div initial={{ scale: 1, opacity: 0.3 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-full islamic-gradient" />
                    )}
                    <motion.button whileTap={{ scale: 0.92 }} onClick={handleTapZahra}
                      className="relative w-40 h-40 rounded-full flex flex-col items-center justify-center active:opacity-90 transition-opacity">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--secondary) / 0.4)" strokeWidth="5" />
                        <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 72}`}
                          strokeDashoffset={`${2 * Math.PI * 72 * (1 - count / current.target)}`}
                          className="transition-all duration-200" />
                      </svg>
                      <span className="text-5xl font-bold text-foreground tracking-tighter">{count}</span>
                      <span className="text-xs text-muted-foreground/50 mt-1 font-semibold">/ {current.target}</span>
                    </motion.button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 font-medium">اضغط للتسبيح</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="relative mb-6">
                {showPulse && (
                  <motion.div initial={{ scale: 1, opacity: 0.25 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-full islamic-gradient" />
                )}
                <div className="w-48 h-48 rounded-full border-[5px] border-primary/15 flex flex-col items-center justify-center bg-card/30 backdrop-blur-sm shadow-inner">
                  <motion.span key={openCount} initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.1 }}
                    className="text-6xl font-bold text-foreground tracking-tighter">
                    {openCount}
                  </motion.span>
                  <span className="text-sm text-muted-foreground/60 mt-1 font-semibold">تسبيحة</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/30 mt-4 font-medium">اضغط في أي مكان على الشاشة</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TasbihPage;
