/**
 * Madhhab switch verification modal.
 *
 * Triggered when the user wants to change school of thought AFTER the initial
 * onboarding choice. Presents 3 EASY GENERAL Islamic-knowledge questions
 * (rotated each open) — strictly non-sectarian — to confirm intent.
 *
 * Visual: minimal black/white sheet matching the design system, no bold.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import {
  pickSwitchQuestions,
  setMadhhab,
  type Madhhab,
  type SwitchQuestion,
} from '@/lib/madhhab';

interface Props {
  open: boolean;
  targetMadhhab: Madhhab;
  onClose: () => void;
  onSuccess: () => void;
}

const MadhhabSwitchModal = ({ open, targetMadhhab, onClose, onSuccess }: Props) => {
  const [questions, setQuestions] = useState<SwitchQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setQuestions(pickSwitchQuestions(3));
      setStep(0);
      setAnswers({});
      setError(null);
    }
  }, [open]);

  const current = questions[step];
  const total = questions.length;

  const targetLabel = useMemo(
    () => (targetMadhhab === 'sunni' ? 'مسلم سُنّي' : 'مسلم شيعي'),
    [targetMadhhab],
  );

  const handlePick = (idx: number) => {
    if (!current) return;
    setError(null);
    setAnswers((a) => ({ ...a, [current.id]: idx }));
  };

  const handleNext = () => {
    if (!current) return;
    const picked = answers[current.id];
    if (picked === undefined) {
      setError('اختر إجابة للمتابعة');
      return;
    }
    if (picked !== current.answer) {
      setError('الإجابة غير صحيحة، حاول مرة أخرى');
      return;
    }
    setError(null);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      // All correct — commit the change.
      setMadhhab(targetMadhhab);
      onSuccess();
    }
  };

  const progress = total > 0 ? ((step + 1) / total) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm flex items-end justify-center"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-full max-w-md bg-card rounded-t-3xl border-t border-border/30 shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-border/60" />
            </div>

            {/* Header */}
            <div className="px-5 pt-3 pb-4 border-b border-border/15">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-muted-foreground/70 font-light tabular-nums">
                  {step + 1} / {total}
                </p>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/50"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </button>
              </div>
              <h2 className="text-[16px] text-foreground" style={{ fontWeight: 400 }}>
                تأكيد تبديل المذهب إلى {targetLabel}
              </h2>
              <p className="text-[11px] text-muted-foreground/70 font-light mt-1 leading-relaxed">
                ٣ أسئلة معرفة عامة بسيطة للتأكد من جدية الاختيار. لا تتعلق بأي طرف.
              </p>

              <div className="mt-3 h-[2px] w-full rounded-full bg-border/40 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {current && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="text-[15px] text-foreground mb-5 leading-relaxed" style={{ fontWeight: 400 }}>
                      {current.question}
                    </p>

                    <div className="space-y-2">
                      {current.options.map((opt, idx) => {
                        const picked = answers[current.id] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handlePick(idx)}
                            className={`w-full px-4 py-3 rounded-2xl border text-right transition-all active:scale-[0.99] flex items-center justify-between gap-3 ${
                              picked
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'border-border/40 bg-card text-foreground/85 hover:border-border/70'
                            }`}
                          >
                            <span className="text-[13.5px]" style={{ fontWeight: 300 }}>
                              {opt}
                            </span>
                            {picked && (
                              <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {error && (
                      <p className="text-[11px] text-destructive font-light mt-3 text-center">
                        {error}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pt-3 pb-5 border-t border-border/15">
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] active:scale-[0.98] transition-transform"
                style={{ fontWeight: 400 }}
              >
                {step < total - 1 ? 'التالي' : 'تأكيد التبديل'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MadhhabSwitchModal;
