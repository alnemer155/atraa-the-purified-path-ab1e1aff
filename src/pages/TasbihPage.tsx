import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Vibrate, Volume2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTasbihState } from '@/lib/user';
import { useMadhhab } from '@/lib/madhhab';

const tasbihatZahra = [
  { text: 'الله اكبر', target: 34 },
  { text: 'الحمد لله', target: 33 },
  { text: 'سبحان الله', target: 33 },
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
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

const TasbihPage = () => {
  const madhhab = useMadhhab();
  // Sunni users only get the open counter (renamed "عداد الأذكار").
  // The "Tasbih al-Zahra (a.s.)" mode is Shia-specific.
  const [mode, setMode] = useState<TasbihMode>(madhhab === 'sunni' ? 'open' : 'zahra');
  useEffect(() => { if (madhhab === 'sunni' && mode !== 'open') setMode('open'); }, [madhhab, mode]);
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
    if (vibration && navigator.vibrate) navigator.vibrate(12);
    if (sound) playTasbihSound();
  }, [vibration, sound]);

  const triggerPulse = useCallback(() => {
    setShowPulse(true);
    setTimeout(() => setShowPulse(false), 250);
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
      <div className="flex gap-1.5 mb-5" data-control>
        {[
          { key: 'zahra' as const, label: 'تسبيح الزهراء (ع)', desc: '١٠٠ تسبيحة' },
          { key: 'open' as const, label: 'تسبيح حر', desc: 'بلا حدود' },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setStep(0); setCount(0); }}
            className={`flex-1 py-3 px-3 rounded-2xl text-center transition-all active:scale-[0.97] ${
              mode === m.key
                ? 'bg-foreground text-background'
                : 'bg-card border border-border/20 text-foreground'
            }`}
          >
            <span className="text-[12px] block">{m.label}</span>
            <span className={`text-[8px] font-light block mt-0.5 ${mode === m.key ? 'text-background/50' : 'text-muted-foreground/40'}`}>{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-3 px-1" data-control>
        <button onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] text-muted-foreground/50 active:scale-95 transition-transform">
          <RotateCcw className="w-3.5 h-3.5" /> إعادة
        </button>
        <div className="flex items-center gap-1">
          <button onClick={toggleVibration}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${vibration ? 'text-foreground' : 'text-muted-foreground/25'}`}>
            <Vibrate className="w-4 h-4" />
          </button>
          <button onClick={toggleSound}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${sound ? 'text-foreground' : 'text-muted-foreground/25'}`}>
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
                      <div className={`mx-auto w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] mb-2 transition-all ${
                        isDone ? 'bg-foreground text-background'
                          : isCurrent ? 'border border-foreground/20 text-foreground'
                          : 'bg-secondary/30 text-muted-foreground/35'
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <p className={`text-[10px] ${isCurrent ? 'text-foreground' : isDone ? 'text-foreground' : 'text-muted-foreground/35'}`}>{t.text}</p>
                      <p className={`text-[8px] mt-0.5 font-light ${isCurrent ? 'text-muted-foreground/50' : 'text-muted-foreground/25'}`}>{t.target}×</p>
                    </div>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="w-full max-w-[300px] mb-8">
                <div className="h-[3px] rounded-full bg-secondary/30 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-foreground/25" animate={{ width: `${(totalDone / totalAll) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[8px] text-muted-foreground/30 font-light">{totalDone} / {totalAll}</span>
                  <span className="text-[8px] text-muted-foreground/40">{Math.round((totalDone / totalAll) * 100)}%</span>
                </div>
              </div>

              {isComplete ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                  <div className="w-24 h-24 mx-auto mb-5 rounded-full border border-foreground/15 flex items-center justify-center">
                    <Check className="w-12 h-12 text-foreground/60" />
                  </div>
                  <p className="text-2xl text-foreground mb-1.5">تم بحمد الله</p>
                  <p className="text-[12px] text-muted-foreground/50 font-light">{totalAll} تسبيحة</p>
                </motion.div>
              ) : (
                <>
                  <motion.p key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-xl text-foreground mb-8 tracking-tight">
                    {current.text}
                  </motion.p>

                  <div className="relative mb-6">
                    {showPulse && (
                      <motion.div initial={{ scale: 1, opacity: 0.2 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="absolute inset-0 rounded-full border border-foreground/15" />
                    )}
                    <motion.button whileTap={{ scale: 0.93 }} onClick={handleTapZahra}
                      className="relative w-40 h-40 rounded-full flex flex-col items-center justify-center active:opacity-90 transition-opacity">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--secondary) / 0.3)" strokeWidth="2" />
                        <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="2" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 72}`}
                          strokeDashoffset={`${2 * Math.PI * 72 * (1 - count / current.target)}`}
                          className="transition-all duration-200" />
                      </svg>
                      <span className="text-5xl text-foreground tracking-tighter font-light">{count}</span>
                      <span className="text-[10px] text-muted-foreground/40 mt-1 font-light">/ {current.target}</span>
                    </motion.button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/30 font-light">اضغط للتسبيح</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="relative mb-6">
                {showPulse && (
                  <motion.div initial={{ scale: 1, opacity: 0.2 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="absolute inset-0 rounded-full border border-foreground/15" />
                )}
                <div className="w-48 h-48 rounded-full border border-border/15 flex flex-col items-center justify-center">
                  <motion.span key={openCount} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 0.1 }}
                    className="text-6xl text-foreground tracking-tighter font-light">
                    {openCount}
                  </motion.span>
                  <span className="text-[12px] text-muted-foreground/40 mt-1 font-light">تسبيحة</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/25 mt-4 font-light">اضغط في أي مكان على الشاشة</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TasbihPage;
