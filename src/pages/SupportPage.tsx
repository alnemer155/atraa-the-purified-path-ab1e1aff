import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Check, FileText, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AMOUNTS_SAR = [10, 25, 50, 100, 250, 500];

type Stage = 'compliance' | 'amount' | 'invoice' | 'thanks';

const SupportPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [stage, setStage] = useState<Stage>('compliance');
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [invoiceId] = useState<string>(() => `ATR-${Date.now().toString().slice(-8)}`);
  const [copied, setCopied] = useState(false);

  const finalAmount = customAmount.trim() && !isNaN(Number(customAmount))
    ? Math.max(1, Math.floor(Number(customAmount)))
    : amount;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(invoiceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`px-4 py-5 pb-32 animate-fade-in ${isAr ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg text-foreground tracking-tight flex items-center gap-2 justify-start">
          <Heart className="w-4 h-4 text-primary" strokeWidth={1.5} />
          {isAr ? 'دعم عِتَرَةً' : 'Support Atraa'}
        </h1>
        <p className="text-[10px] text-muted-foreground/55 font-light mt-0.5">
          {isAr
            ? 'مساهمتك تساعد على استمرار التطوير والصيانة'
            : 'Your contribution keeps Atraa running'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Stage 1: Sharia compliance modal */}
        {stage === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="bg-card border border-border/30 rounded-2xl p-5 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-[13px] text-foreground font-medium">
                    {isAr ? 'تنبيه شرعي مهم' : 'Important Sharia notice'}
                  </h2>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-light">
                    {isAr ? 'يرجى القراءة قبل المتابعة' : 'Please read before proceeding'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-[12px] leading-relaxed text-foreground/80 font-light">
                {isAr ? (
                  <>
                    <p>
                      هذا المبلغ <span className="text-foreground font-medium">ليس صدقة شرعية</span> ولا يُحتسب من الزكاة أو الخمس أو الكفّارات.
                    </p>
                    <p>
                      هو تبرّع تطوّعي مخصّص <span className="text-foreground font-medium">لتشغيل وصيانة وتطوير</span> منصة عِتَرَةً (تكاليف الخوادم، الذكاء الاصطناعي، البنية التحتية).
                    </p>
                    <p>
                      الحقوق الشرعية يجب أن تُسلَّم إلى <span className="text-foreground font-medium">المراجع المعتمدين</span> أو وكلائهم المخوّلين، وليس إلى أيّ منصة تقنية.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      This amount is <span className="text-foreground font-medium">not a Sharia donation</span>. It is not counted as Zakat, Khums, or Kaffarah.
                    </p>
                    <p>
                      It is a voluntary contribution dedicated to <span className="text-foreground font-medium">operating, maintaining and developing</span> Atraa (servers, AI, infrastructure).
                    </p>
                    <p>
                      Religious obligations must be paid to <span className="text-foreground font-medium">authorized maraji'</span> or their deputies, not to any technical platform.
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary/40 text-foreground text-[12px] active:scale-95 transition-transform"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => setStage('amount')}
                  className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-[12px] active:scale-95 transition-transform"
                >
                  {isAr ? 'فهمت، متابعة' : 'I understand, continue'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 2: choose amount */}
        {stage === 'amount' && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="bg-card border border-border/30 rounded-2xl p-5 shadow-card">
              <p className="text-[11px] text-muted-foreground/70 mb-3 font-light">
                {isAr ? 'اختر مبلغ المساهمة (ريال سعودي)' : 'Select contribution amount (SAR)'}
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {AMOUNTS_SAR.map(a => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(''); }}
                    className={`py-3 rounded-xl text-[14px] tabular-nums transition-all ${
                      amount === a && !customAmount
                        ? 'bg-foreground text-background'
                        : 'bg-secondary/40 text-foreground border border-border/20'
                    }`}
                  >
                    {a}
                    <span className="text-[9px] font-light opacity-70 ms-0.5">SAR</span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground/60 mb-1.5 font-light">
                {isAr ? 'أو مبلغ مخصّص' : 'Or custom amount'}
              </p>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={isAr ? 'مثال: 75' : 'e.g. 75'}
                className="w-full bg-secondary/30 border border-border/20 rounded-xl px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30"
              />

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setStage('compliance')}
                  className="flex-1 py-2.5 rounded-xl bg-secondary/40 text-foreground text-[12px] active:scale-95 transition-transform"
                >
                  {isAr ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={() => setStage('invoice')}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-[12px] active:scale-95 transition-transform"
                >
                  {isAr ? `متابعة · ${finalAmount} ر.س` : `Continue · ${finalAmount} SAR`}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 3: invoice */}
        {stage === 'invoice' && (
          <motion.div
            key="invoice"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="bg-card border border-border/30 rounded-2xl overflow-hidden shadow-card">
              {/* Invoice header */}
              <div className="bg-secondary/30 px-5 py-4 border-b border-border/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-light">
                      {isAr ? 'فاتورة' : 'Invoice'}
                    </p>
                    <p className="text-[14px] text-foreground tabular-nums mt-0.5 font-medium">{invoiceId}</p>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground/50" strokeWidth={1.5} />
                </div>
              </div>

              {/* Invoice body */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground/70 font-light">{isAr ? 'البند' : 'Item'}</span>
                  <span className="text-foreground">{isAr ? 'دعم عِتَرَةً' : 'Atraa contribution'}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground/70 font-light">{isAr ? 'التاريخ' : 'Date'}</span>
                  <span className="text-foreground tabular-nums">
                    {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground/70 font-light">{isAr ? 'العملة' : 'Currency'}</span>
                  <span className="text-foreground">SAR</span>
                </div>
                <div className="h-px bg-border/30 my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground font-medium">
                    {isAr ? 'المجموع' : 'Total'}
                  </span>
                  <span className="text-[18px] text-foreground tabular-nums font-medium">
                    {finalAmount}
                    <span className="text-[10px] text-muted-foreground/60 ms-1 font-light">SAR</span>
                  </span>
                </div>
              </div>

              {/* Copy invoice id */}
              <button
                onClick={handleCopy}
                className="w-full px-5 py-3 bg-secondary/20 border-t border-border/15 flex items-center justify-center gap-2 text-[11px] text-muted-foreground active:bg-secondary/40 transition-colors"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-primary" /> {isAr ? 'تم النسخ' : 'Copied'}</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> {isAr ? 'نسخ رقم الفاتورة' : 'Copy invoice ID'}</>
                )}
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground/50 text-center font-light px-4 leading-relaxed">
              {isAr
                ? 'بوابة الدفع (Tap Payments — مدى وApple Pay) قيد التفعيل. اضغط "تأكيد" لمحاكاة العملية.'
                : 'Payment gateway (Tap Payments — Mada & Apple Pay) is being activated. Tap "Confirm" to simulate.'}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setStage('amount')}
                className="flex-1 py-2.5 rounded-xl bg-secondary/40 text-foreground text-[12px] active:scale-95 transition-transform"
              >
                {isAr ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={() => setStage('thanks')}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-[12px] active:scale-95 transition-transform"
              >
                {isAr ? 'تأكيد الدفع' : 'Confirm payment'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Stage 4: thanks */}
        {stage === 'thanks' && (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-card border border-border/30 rounded-2xl p-7 shadow-card text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Heart className="w-7 h-7 text-primary" strokeWidth={1.5} fill="currentColor" />
            </motion.div>
            <h2 className="text-[16px] text-foreground font-medium mb-2">
              {isAr ? 'جزاكم الله خيراً' : 'May Allah reward you'}
            </h2>
            <p className="text-[12px] text-muted-foreground/70 font-light leading-relaxed mb-1">
              {isAr
                ? 'تمّ استلام مساهمتك بنجاح، نسأل الله أن يبارك لكم في عمركم ومالكم.'
                : 'Your contribution was received. May Allah bless you in your time and wealth.'}
            </p>
            <p className="text-[11px] text-muted-foreground/50 font-light tabular-nums mt-3">
              #{invoiceId} · {finalAmount} SAR
            </p>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 rounded-xl bg-foreground text-background text-[12px] active:scale-95 transition-transform"
              >
                {isAr ? 'العودة للرئيسية' : 'Back to home'}
              </button>
              <button
                onClick={() => { setStage('compliance'); setCustomAmount(''); }}
                className="w-full py-2 text-[11px] text-muted-foreground/60 active:text-foreground transition-colors"
              >
                {isAr ? 'مساهمة أخرى' : 'Another contribution'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportPage;
