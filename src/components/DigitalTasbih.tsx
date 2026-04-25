import { useState, useCallback } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tasbihat = [
  { text: 'الله أكبر', target: 34 },
  { text: 'الحمد لله', target: 33 },
  { text: 'سبحان الله', target: 33 },
];

const TOTAL = tasbihat.reduce((s, t) => s + t.target, 0);
const SIZE = 168; // SVG size
const STROKE = 3;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DigitalTasbih = () => {
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0); // increments per tap to retrigger animations

  const current = tasbihat[step];
  const isComplete = step === tasbihat.length - 1 && count >= current.target;

  const stepProgress = count / current.target;
  const totalDone = tasbihat.slice(0, step).reduce((s, t) => s + t.target, 0) + count;

  const handleTap = useCallback(() => {
    if (isComplete) return;
    if (navigator.vibrate) navigator.vibrate(10);
    setPulse((p) => p + 1);

    if (count + 1 >= current.target) {
      if (step + 1 < tasbihat.length) {
        setStep(step + 1);
        setCount(0);
      } else {
        setCount(current.target);
      }
    } else {
      setCount((c) => c + 1);
    }
  }, [count, step, current, isComplete]);

  const handleReset = () => {
    setStep(0);
    setCount(0);
    setPulse(0);
  };

  return (
    <div className="rounded-3xl bg-card border border-border/30 p-5 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[14px] text-foreground font-medium">تسبيح الزهراء عليها السلام</h2>
          <p className="text-[10px] text-muted-foreground/60 font-light mt-0.5 tabular-nums">
            {totalDone} / {TOTAL}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="w-9 h-9 rounded-full bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 flex items-center justify-center transition-colors active:scale-90"
          aria-label="reset"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Step indicators — three minimalist dots with active label */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {tasbihat.map((t, i) => {
          const isActive = i === step;
          const isDone = i < step || (i === step && isComplete);
          return (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.85,
                  opacity: isDone ? 1 : isActive ? 1 : 0.35,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : isDone
                    ? 'text-foreground/70'
                    : 'text-muted-foreground/50'
                }`}
              >
                {isDone && (
                  <Check className="w-2.5 h-2.5 text-primary" strokeWidth={2.5} />
                )}
                <span className="text-[10px] font-light whitespace-nowrap">{t.text}</span>
              </motion.div>
              {i < tasbihat.length - 1 && (
                <div className="w-2 h-px bg-border/60" />
              )}
            </div>
          );
        })}
      </div>

      {/* Counter ring */}
      <div className="relative flex items-center justify-center mb-1" style={{ height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={STROKE}
            opacity={0.4}
          />
          {/* Progress */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - stepProgress) }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          />
        </svg>

        {/* Center button */}
        <button
          onClick={handleTap}
          disabled={isComplete}
          className="absolute inset-0 m-auto rounded-full flex flex-col items-center justify-center select-none active:scale-95 transition-transform disabled:cursor-default"
          style={{ width: SIZE - 32, height: SIZE - 32 }}
          aria-label="tap"
        >
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="done"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
                  <Check className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <p className="text-[12px] text-foreground font-medium">تم بحمد الله</p>
              </motion.div>
            ) : (
              <motion.div
                key={`${step}-${count}`}
                initial={{ scale: 0.92, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center"
              >
                <p className="text-[10px] text-muted-foreground/60 font-light mb-1">{current.text}</p>
                <p className="text-[44px] text-foreground tabular-nums leading-none font-light">
                  {count}
                </p>
                <p className="text-[10px] text-muted-foreground/50 font-light mt-1 tabular-nums">
                  / {current.target}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle pulse ring on tap */}
          {!isComplete && (
            <motion.div
              key={`pulse-${pulse}`}
              initial={{ scale: 1, opacity: 0.35 }}
              animate={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-primary pointer-events-none"
            />
          )}
        </button>
      </div>

      {/* Hint */}
      <p className="text-[9px] text-muted-foreground/40 font-light text-center mt-3">
        المس الدائرة للتسبيح
      </p>
    </div>
  );
};

export default DigitalTasbih;
