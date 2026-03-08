import { useState, useCallback, useEffect, useRef } from 'react';
import { RotateCcw, Vibrate, Volume2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTasbihState } from '@/lib/user';

const tasbihatZahra = [
  { text: 'الله اكبر', target: 34 },
  { text: 'الحمد لله', target: 33 },
  { text: 'سبحان الله', target: 33 },
];

type TasbihMode = 'zahra' | 'open';

// Calm Islamic-style sound using gentle sine wave
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

  useEffect(() => {
    localStorage.setItem('atraa_open_tasbih', String(openCount));
  }, [openCount]);

  // Save tasbih state for homepage continuation
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
      if (step + 1 < tasbihatZahra.length) {
        setStep(step + 1);
        setCount(0);
      } else {
        setCount(current.target);
      }
    } else {
      setCount(c => c + 1);
    }
  }, [count, step, current, doFeedback, triggerPulse]);

  const handleTapOpen = useCallback(() => {
    doFeedback();
    triggerPulse();
    setOpenCount(c => c + 1);
  }, [doFeedback, triggerPulse]);

  const handleReset = () => {
    setStep(0);
    setCount(0);
    if (mode === 'open') setOpenCount(0);
  };

  const toggleVibration = () => {
    const next = !vibration;
    setVibration(next);
    localStorage.setItem('atraa_tasbih_vibrate', String(next));
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    localStorage.setItem('atraa_tasbih_sound', String(next));
  };

  const isComplete = mode === 'zahra' && step === tasbihatZahra.length - 1 && count >= current.target;

  const handleScreenTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'open') return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-control]')) return;
    handleTapOpen();
  }, [mode, handleTapOpen]);

  return (
    <div
      className="px-4 py-4 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col select-none"
      onClick={mode === 'open' ? handleScreenTap : undefined}
    >
      {/* Mode selector */}
      <div className="flex gap-2 mb-4" data-control>
        <button
          onClick={() => { setMode('zahra'); setStep(0); setCount(0); }}
          className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
            mode === 'zahra' ? 'islamic-gradient text-primary-foreground shadow-card' : 'bg-card border border-border text-foreground'
          }`}
        >
          تسبيح الزهراء ❁
        </button>
        <button
          onClick={() => { setMode('open'); setStep(0); setCount(0); }}
          className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
            mode === 'open' ? 'islamic-gradient text-primary-foreground shadow-card' : 'bg-card border border-border text-foreground'
          }`}
        >
          تسبيح حر
        </button>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between mb-2" data-control>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          إعادة
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleVibration}
            className={`p-2 rounded-xl transition-colors ${vibration ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          >
            <Vibrate className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl transition-colors ${sound ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {mode === 'zahra' ? (
            <motion.div
              key="zahra"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              {/* Step indicators */}
              <div className="flex gap-3 mb-6 w-full max-w-[280px]">
                {tasbihatZahra.map((t, i) => {
                  const isDone = i < step || (i === step && isComplete);
                  const isCurrent = i === step && !isComplete;
                  return (
                    <div key={i} className="flex-1 text-center">
                      <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5 transition-all ${
                        isDone
                          ? 'islamic-gradient text-primary-foreground shadow-card'
                          : isCurrent
                          ? 'bg-primary/15 text-primary border-2 border-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <p className={`text-[10px] font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{t.text}</p>
                      <p className="text-[9px] text-muted-foreground/70">{t.target}</p>
                    </div>
                  );
                })}
              </div>

              {/* Overall progress bar */}
              <div className="w-full max-w-[280px] mb-8">
                <div className="h-1 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full islamic-gradient"
                    animate={{ width: `${(totalDone / totalAll) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {isComplete ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full islamic-gradient flex items-center justify-center shadow-elevated">
                    <Check className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-1">تم بحمد الله</p>
                  <p className="text-sm text-muted-foreground">{totalAll} تسبيحة</p>
                </motion.div>
              ) : (
                <>
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-semibold text-primary mb-6"
                  >
                    {current.text}
                  </motion.p>

                  {/* Counter ring */}
                  <div className="relative mb-4">
                    {showPulse && (
                      <motion.div
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-full islamic-gradient"
                      />
                    )}
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={handleTapZahra}
                      className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center active:opacity-90 transition-opacity"
                    >
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
                        <circle cx="72" cy="72" r="66" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                        <circle
                          cx="72" cy="72" r="66"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 66}`}
                          strokeDashoffset={`${2 * Math.PI * 66 * (1 - count / current.target)}`}
                          className="transition-all duration-200"
                        />
                      </svg>
                      <span className="text-4xl font-bold text-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">/ {current.target}</span>
                    </motion.button>
                  </div>

                  <p className="text-xs text-muted-foreground">اضغط للتسبيح</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-4">
                {showPulse && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-full islamic-gradient"
                  />
                )}
                <div className="w-44 h-44 rounded-full border-4 border-primary/20 flex flex-col items-center justify-center">
                  <motion.span
                    key={openCount}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.1 }}
                    className="text-5xl font-bold text-foreground"
                  >
                    {openCount}
                  </motion.span>
                  <span className="text-sm text-muted-foreground mt-1">تسبيحة</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/60 mt-6">اضغط في أي مكان على الشاشة</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TasbihPage;
