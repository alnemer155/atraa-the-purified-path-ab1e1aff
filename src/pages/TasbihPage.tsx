import { useState, useCallback } from 'react';
import { RotateCcw, Vibrate, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

const tasbihatZahra = [
  { text: 'الله اكبر', target: 34 },
  { text: 'الحمد لله', target: 33 },
  { text: 'سبحان الله', target: 33 },
];

type TasbihMode = 'zahra' | 'open';

const TasbihPage = () => {
  const [mode, setMode] = useState<TasbihMode>('zahra');
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [vibration, setVibration] = useState(() => localStorage.getItem('atraa_tasbih_vibrate') !== 'false');
  const [sound, setSound] = useState(() => localStorage.getItem('atraa_tasbih_sound') === 'true');

  const current = tasbihatZahra[step];
  const totalAll = tasbihatZahra.reduce((s, t) => s + t.target, 0);

  const doFeedback = useCallback(() => {
    if (vibration && navigator.vibrate) {
      navigator.vibrate(20);
    }
    if (sound) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  }, [vibration, sound]);

  const handleTapZahra = useCallback(() => {
    doFeedback();
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
  }, [count, step, current, doFeedback]);

  const handleTapOpen = useCallback(() => {
    doFeedback();
    setOpenCount(c => c + 1);
  }, [doFeedback]);

  const handleReset = () => {
    setStep(0);
    setCount(0);
    setOpenCount(0);
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

  return (
    <div className="px-4 py-4 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode('zahra'); handleReset(); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === 'zahra' ? 'islamic-gradient text-primary-foreground shadow-card' : 'bg-card border border-border text-foreground'
          }`}
        >
          تسبيح الزهراء ❁
        </button>
        <button
          onClick={() => { setMode('open'); handleReset(); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === 'open' ? 'islamic-gradient text-primary-foreground shadow-card' : 'bg-card border border-border text-foreground'
          }`}
        >
          تسبيح حر
        </button>
      </div>

      {/* Settings strip */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button onClick={toggleVibration} className={`p-2 rounded-xl transition-colors ${vibration ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
          <Vibrate className="w-4.5 h-4.5" />
        </button>
        <button onClick={toggleSound} className={`p-2 rounded-xl transition-colors ${sound ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
          <Volume2 className="w-4.5 h-4.5" />
        </button>
        <button onClick={handleReset} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Main counter area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {mode === 'zahra' ? (
          <>
            {/* Progress */}
            <div className="flex gap-1 mb-8 w-full max-w-xs">
              {tasbihatZahra.map((t, i) => (
                <div key={i} className="flex-1">
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full islamic-gradient"
                      animate={{
                        width: i < step ? '100%' : i === step ? `${(count / t.target) * 100}%` : '0%'
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-1">{t.text}</p>
                </div>
              ))}
            </div>

            <p className="text-base text-muted-foreground mb-2">{current.text}</p>
            <p className="text-5xl font-bold text-foreground mb-1">{count}</p>
            <p className="text-sm text-muted-foreground mb-8">من {current.target}</p>

            {isComplete ? (
              <div className="py-6 text-center">
                <p className="text-lg font-semibold text-gold">تم بحمد الله ✓</p>
                <p className="text-xs text-muted-foreground mt-2">{totalAll} تسبيحة</p>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleTapZahra}
                className="w-32 h-32 rounded-full islamic-gradient text-primary-foreground text-xl font-semibold shadow-elevated flex items-center justify-center active:opacity-90 transition-opacity select-none"
              >
                سبّح
              </motion.button>
            )}
          </>
        ) : (
          <>
            <p className="text-6xl font-bold text-foreground mb-2">{openCount}</p>
            <p className="text-sm text-muted-foreground mb-10">تسبيحة</p>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleTapOpen}
              className="w-36 h-36 rounded-full islamic-gradient text-primary-foreground text-xl font-semibold shadow-elevated flex items-center justify-center active:opacity-90 transition-opacity select-none"
            >
              سبّح
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

export default TasbihPage;
