import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, AlertTriangle, ChevronLeft, DollarSign } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const AMOUNTS = [10, 50, 100, 200];

const SupportPage = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleProceed = () => setShowWarning(false);

  const activeAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handlePayment = () => {
    if (!activeAmount || activeAmount < 5) return;
    // Tap payment integration will be added here
  };

  return (
    <>
      {/* Sharia Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/30 backdrop-blur-xl px-5"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-card rounded-3xl p-6 shadow-elevated max-w-sm w-full border border-border/40"
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>
                <h2 className="text-base font-black text-foreground mb-1">تنبيه شرعي — اقرأ قبل المتابعة</h2>
              </div>

              <div className="text-[12px] text-foreground leading-[2] mb-6 religious-text text-center">
                <p className="mb-3">
                  أنا سيدٌ هاشميٌّ موسويٌّ، وتحرمُ عليَّ الصدقةُ بنصٍّ شرعيٍّ صريحٍ لا يقبلُ الاجتهادَ ولا النقاشَ.
                </p>
                <p className="mb-3">
                  إن كانت نيّتُكَ صدقةً — فاعلم أنّها لن تُقبَل منّي، ولن تكون إلا وَبالًا عليكَ لا نفعًا.
                </p>
                <p className="mb-3">
                  أمّا إن أردتَ دعمَ هذا المشروع الديني صادقًا، فليكن ذلك هديةً أو مكافأةً على الجهد المبذول في خدمة الدين — لا غير.
                </p>
                <p className="font-black text-foreground">
                  هذا ليس تواضعًا ولا خجلًا — هذا حكمٌ شرعيٌّ ثابتٌ لا أُساومُ عليه.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleProceed}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all active:scale-[0.98]"
                >
                  ابشر
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/')}
                  className="flex-1 py-3.5 rounded-2xl bg-secondary text-foreground font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة للرئيسية
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Support Page */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="px-4 py-5 pb-32"
      >
        {/* Header */}
        <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-primary" />
          </motion.button>
          <div>
            <h1 className="text-lg font-black text-foreground">داعم الموقع</h1>
            <p className="text-[10px] text-muted-foreground">ادعم مشروع عِتَرَةً</p>
          </div>
        </motion.div>

        {/* Amount Selection */}
        <motion.div variants={fadeUp} custom={1} className="mb-5">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40 shadow-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">اختر المبلغ</p>
                <p className="text-[10px] text-muted-foreground">ريال سعودي</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {AMOUNTS.map(amount => (
                <motion.button
                  key={amount}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                  className={`py-4 rounded-2xl text-center transition-all border ${
                    selectedAmount === amount
                      ? 'bg-primary text-primary-foreground border-primary font-black shadow-lg'
                      : 'bg-secondary/40 text-foreground border-border/40 font-semibold hover:border-primary/30'
                  }`}
                >
                  <span className="text-lg font-black">{amount}</span>
                  <span className="text-[10px] block mt-0.5 opacity-70">ر.س</span>
                </motion.button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                placeholder="مبلغ آخر (الحد الأدنى ٥ ر.س)"
                min={5}
                className="w-full px-4 py-3.5 rounded-2xl bg-secondary/40 border border-border/40 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-sm transition-all"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">ر.س</div>
            </div>
          </div>
        </motion.div>

        {/* Payment Button */}
        <motion.div variants={fadeUp} custom={2}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled
            className="w-full py-4 rounded-2xl bg-primary/50 text-primary-foreground font-bold text-base shadow-lg transition-all opacity-60 flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <DollarSign className="w-5 h-5" />
            قريباً
          </motion.button>
          <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
            الدفع الإلكتروني قيد التفعيل — يدعم مدى · Apple Pay · بطاقة ائتمانية
          </p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SupportPage;
