import { useState, useCallback, useEffect, useMemo } from 'react';
import { RotateCcw, Vibrate, Volume2, VolumeX, Check, VibrateOff } from 'lucide-react';
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
    osc.frequency.value = 528;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

const TasbihPage = () => {
  const madhhab = useMadhhab();
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
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => { localStorage.setItem('atraa_open_tasbih', String(openCount)); }, [openCount]);

  useEffect(() => {
    const totalDone = tasbihatZahra.slice(0, step).reduce((s, t) => s + t.target, 0) + count;
    if (totalDone > 0 || openCount > 0) {
      saveTasbihState({ mode, step, count, openCount, timestamp: Date.now() });
    }
  }, [mode, step, count, openCount]);

  const current = tasbihatZahra[step];
  const totalAll = useMemo(() => tasbihatZahra.reduce((s, t) => s + t.target, 0), []);
  const totalDone = tasbihatZahra.slice(0, step).reduce((s, t) => s + t.target, 0) + count;

  const doFeedback = useCallback(() => {
    if (vibration && navigator.vibrate) navigator.vibrate(10);
    if (sound) playTasbihSound();
    setPulseKey(k => k + 1);
  }, [vibration, sound]);

  const handleTapZahra = useCallback(() => {
    doFeedback();
    if (count + 1 >= current.target) {
      if (step + 1 < tasbihatZahra.length) { setStep(step + 1); setCount(0); }
      else { setCount(current.target); }
    } else { setCount(c => c + 1); }
  }, [count, step, current, doFeedback]);

  const handleTapOpen = useCallback(() => {
    doFeedback();
    setOpenCount(c => c + 1);
  }, [doFeedback]);

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

  // ─── Visual values ──────────────────────────────────────────────
  const RING = 220; // px
  const STROKE = 2;
  const radius = (RING / 2) - STROKE - 6;
  const circ = 2 * Math.PI * radius;
  const progress = mode === 'zahra' ? count / current.target : (openCount % 100) / 100;
  const displayCount = mode === 'zahra' ? count : openCount;
  const displayTarget = mode === 'zahra' ? current.target : null;

  return (
    <div
      className="relative px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col select-none overflow-hidden"
      onClick={mode === 'open' ? handleScreenTap : undefined}
    >
      {/* ambient radial backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 38%, hsl(var(--gold) / 0.06) 0%, transparent 55%)',
        }}
      />

      {/* ─── Mode switcher (Shia only) / label (Sunni) ─── */}
      {madhhab === 'shia' ? (
        <div className="relative mb-6 flex justify-center" data-control>
          <div className="inline-flex p-1 rounded-full bg-secondary/30 border border-border/15">
            {[
              { key: 'zahra' as const, label: 'الزهراء (ع)' },
              { key: 'open' as const, label: 'حر' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); setStep(0); setCount(0); }}
                className={`relative px-5 py-1.5 rounded-full text-[11px] transition-all ${
                  mode === m.key
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground/70'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative mb-6 text-center" data-control>
          <p className="text-[12px] text-foreground/85 tracking-wide">عَدّاد الأذكار</p>
          <p className="text-[9.5px] text-muted-foreground/50 font-light mt-1">المس أي مكان للإحصاء</p>
        </div>
      )}

      {/* ─── Step tracker (Zahra only) ─── */}
      {mode === 'zahra' && !isComplete && (
        <div className="relative flex items-center justify-center gap-2 mb-6">
          {tasbihatZahra.map((t, i) => {
            const done = i < step;
            const cur = i === step;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                    cur
                      ? 'bg-foreground/8 border border-gold/30'
                      : done
                      ? 'bg-foreground/5 border border-border/10'
                      : 'border border-border/10 opacity-40'
                  }`}
                >
                  {done && <Check className="w-2.5 h-2.5 text-gold" strokeWidth={2.5} />}
                  <span className={`text-[9.5px] font-light ${cur ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                    {t.text}
                  </span>
                </div>
                {i < tasbihatZahra.length - 1 && <span className="w-1 h-px bg-border/30" />}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Main counter area ─── */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="text-center"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/20 to-transparent" />
              <div className="absolute inset-2 rounded-full border border-gold/30 flex items-center justify-center">
                <Check className="w-14 h-14 text-gold" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-[22px] text-foreground tracking-tight mb-1">تم بحمد الله</p>
            <p className="text-[10.5px] text-muted-foreground/55 font-light">
              {totalAll} تسبيحة · جزاكم الله خيراً
            </p>
            <button
              onClick={handleReset}
              data-control
              className="mt-7 px-5 py-2 rounded-full bg-secondary/40 border border-border/15 text-[11px] text-foreground/85 active:scale-95"
            >
              إعادة البدء
            </button>
          </motion.div>
        ) : (
          <>
            {/* Current dhikr text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={mode === 'zahra' ? `z-${step}` : 'open'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-[20px] text-foreground tracking-tight mb-7 font-light"
              >
                {mode === 'zahra' ? current.text : 'سبحان الله'}
              </motion.p>
            </AnimatePresence>

            {/* The ring */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={mode === 'zahra' ? handleTapZahra : undefined}
              className="relative active:opacity-95"
              style={{ width: RING, height: RING }}
              aria-label="تسبيح"
            >
              {/* breathing aura */}
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, hsl(var(--gold) / 0.12) 0%, transparent 70%)',
                }}
                animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0.85, 0.6] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* pulse on tap */}
              <AnimatePresence>
                <motion.div
                  key={pulseKey}
                  initial={{ scale: 0.95, opacity: 0.35 }}
                  animate={{ scale: 1.18, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-gold/40 pointer-events-none"
                />
              </AnimatePresence>

              {/* Progress ring */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox={`0 0 ${RING} ${RING}`}
              >
                <defs>
                  <linearGradient id="tasbihGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                <circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--border) / 0.35)"
                  strokeWidth={STROKE}
                />
                <motion.circle
                  cx={RING / 2}
                  cy={RING / 2}
                  r={radius}
                  fill="none"
                  stroke="url(#tasbihGrad)"
                  strokeWidth={STROKE + 0.5}
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={false}
                  animate={{ strokeDashoffset: circ * (1 - progress) }}
                  transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                />
              </svg>

              {/* inner disc */}
              <div className="absolute inset-5 rounded-full bg-gradient-to-b from-secondary/15 to-background border border-border/10 flex flex-col items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={displayCount}
                    initial={{ y: 8, opacity: 0, scale: 0.94 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -8, opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.18 }}
                    className="text-[64px] leading-none text-foreground font-light tracking-tighter tabular-nums"
                  >
                    {displayCount}
                  </motion.span>
                </AnimatePresence>
                {displayTarget !== null && (
                  <span className="text-[10px] text-muted-foreground/50 font-light mt-1.5 tabular-nums">
                    من {displayTarget}
                  </span>
                )}
                {mode === 'open' && (
                  <span className="text-[10px] text-muted-foreground/50 font-light mt-1.5">تسبيحة</span>
                )}
              </div>
            </motion.button>

            {/* Total progress (Zahra only) */}
            {mode === 'zahra' && (
              <div className="w-full max-w-[260px] mt-8">
                <div className="h-[2px] rounded-full bg-border/25 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-l from-gold/70 to-primary/60"
                    initial={false}
                    animate={{ width: `${(totalDone / totalAll) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5 px-0.5">
                  <span className="text-[8.5px] text-muted-foreground/45 font-light tabular-nums">
                    {totalDone} / {totalAll}
                  </span>
                  <span className="text-[8.5px] text-muted-foreground/55 tabular-nums">
                    {Math.round((totalDone / totalAll) * 100)}٪
                  </span>
                </div>
              </div>
            )}

            <p className="text-[9.5px] text-muted-foreground/40 mt-7 font-light">
              {mode === 'zahra' ? 'المس الدائرة للتسبيح' : 'المس الشاشة للإحصاء'}
            </p>
          </>
        )}
      </div>

      {/* ─── Floating control bar ─── */}
      <div
        data-control
        className="relative mt-4 mx-auto inline-flex items-center gap-1 p-1 rounded-full bg-secondary/30 border border-border/15 backdrop-blur-xl self-center"
      >
        <button
          onClick={handleReset}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground/70 active:scale-90 active:bg-secondary/50 transition-all"
          aria-label="إعادة"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.6} />
        </button>
        <span className="w-px h-4 bg-border/30" />
        <button
          onClick={toggleVibration}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            vibration ? 'text-foreground bg-foreground/5' : 'text-muted-foreground/35'
          }`}
          aria-label="اهتزاز"
        >
          {vibration ? <Vibrate className="w-3.5 h-3.5" strokeWidth={1.6} /> : <VibrateOff className="w-3.5 h-3.5" strokeWidth={1.6} />}
        </button>
        <button
          onClick={toggleSound}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            sound ? 'text-foreground bg-foreground/5' : 'text-muted-foreground/35'
          }`}
          aria-label="صوت"
        >
          {sound ? <Volume2 className="w-3.5 h-3.5" strokeWidth={1.6} /> : <VolumeX className="w-3.5 h-3.5" strokeWidth={1.6} />}
        </button>
      </div>
    </div>
  );
};

export default TasbihPage;
