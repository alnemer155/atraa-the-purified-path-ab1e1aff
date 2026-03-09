import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const tasbihat = [
  { text: 'الله اكبر', target: 34 },
  { text: 'الحمد لله', target: 33 },
  { text: 'سبحان الله', target: 33 },
];

const DigitalTasbih = () => {
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);

  const current = tasbihat[step];
  const totalDone = tasbihat.slice(0, step).reduce((s, t) => s + t.target, 0) + count;
  const totalAll = tasbihat.reduce((s, t) => s + t.target, 0);

  const handleTap = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(15);
    if (count + 1 >= current.target) {
      if (step + 1 < tasbihat.length) {
        setStep(step + 1);
        setCount(0);
      } else {
        // Complete!
        setCount(current.target);
      }
    } else {
      setCount(c => c + 1);
    }
  }, [count, step, current]);

  const handleReset = () => {
    setStep(0);
    setCount(0);
  };

  const isComplete = step === tasbihat.length - 1 && count >= current.target;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">تسبيح الزهراء ❁</h2>
        <button onClick={handleReset} className="p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-colors">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-4">
        {tasbihat.map((t, i) => (
          <div key={i} className="flex-1">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full islamic-gradient"
                initial={{ width: 0 }}
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

      {/* Counter */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">{current.text}</p>
        <p className="text-3xl font-bold text-primary mb-1">{count}</p>
        <p className="text-xs text-muted-foreground mb-4">من {current.target}</p>

        {isComplete ? (
          <div className="py-4 text-center">
            <p className="text-base font-semibold text-gold">تم بحمد الله ✓</p>
            <p className="text-xs text-muted-foreground mt-1">{totalAll} تسبيحة</p>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTap}
            className="w-24 h-24 rounded-full islamic-gradient text-primary-foreground text-lg font-semibold shadow-elevated mx-auto flex items-center justify-center active:opacity-90 transition-opacity select-none"
          >
            سبّح
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default DigitalTasbih;
