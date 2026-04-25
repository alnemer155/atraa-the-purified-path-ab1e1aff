import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initializePaddle, getPaddlePriceId } from '@/lib/paddle';
import { PaymentTestModeBanner } from '@/components/PaymentTestModeBanner';
import { toast } from 'sonner';

type Tier = {
  priceId: string;
  sar: number;
};

const TIERS: Tier[] = [
  { priceId: 'support_sar_10', sar: 10 },
  { priceId: 'support_sar_25', sar: 25 },
  { priceId: 'support_sar_50', sar: 50 },
  { priceId: 'support_sar_100', sar: 100 },
  { priceId: 'support_sar_250', sar: 250 },
  { priceId: 'support_sar_500', sar: 500 },
];

type Stage = 'compliance' | 'choose';

const SupportPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [stage, setStage] = useState<Stage>('compliance');
  const [selectedSar, setSelectedSar] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedTier = TIERS.find((t) => t.sar === selectedSar) || null;

  const handleConfirm = async () => {
    if (!selectedTier || loading) return;
    setLoading(true);

    try {
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(selectedTier.priceId);

      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customData: {
          source: 'atraa_support_page',
          tier_sar: String(selectedTier.sar),
        },
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: isAr ? 'ar' : 'en',
          successUrl: `${window.location.origin}/support/thanks?tier=${selectedTier.sar}`,
          allowLogout: false,
          variant: 'one-page',
        },
      });
    } catch (e) {
      console.error('Checkout error:', e);
      toast.error(isAr ? 'تعذّر فتح صفحة الدفع' : 'Could not open checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PaymentTestModeBanner />
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
          {/* Stage 1: Sharia compliance */}
          {stage === 'compliance' && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="bg-card border border-border/30 rounded-2xl p-5 shadow-card">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[13px] text-foreground font-medium">
                      {isAr ? 'تنبيه شرعي مهم جدًا' : 'Very important Sharia notice'}
                    </h2>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-light">
                      {isAr ? 'يرجى القراءة قبل المتابعة' : 'Please read before proceeding'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-[12px] leading-relaxed text-foreground/85 font-light">
                  {isAr ? (
                    <>
                      <p>
                        أودّ التنويه بأنني من <span className="text-foreground font-medium">السادة الهاشميين</span>، ولا تجوز لي الصدقة شرعًا.
                      </p>
                      <p>
                        لذلك، في حال كانت نيتك تقديم <span className="text-foreground font-medium">صدقة</span>، فيُرجى صرفها إلى مستحقيها، وعدم إرسالها لهذا المشروع.
                      </p>
                      <p>
                        أمّا إن كان الدعم بقصد <span className="text-foreground font-medium">التقدير أو المكافأة</span> على الجهد المبذول، فيُقبل ذلك بكل امتنان.
                      </p>
                      <p className="text-muted-foreground/70">
                        شكرًا لتفهمكم واحترامكم.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Please note that the developer is <span className="text-foreground font-medium">a Hashemite Sayyid</span>, to whom Sadaqah is not religiously permitted.
                      </p>
                      <p>
                        If your intention is to give <span className="text-foreground font-medium">Sadaqah</span>, kindly direct it to its rightful recipients and not to this project.
                      </p>
                      <p>
                        However, if your support is intended as an <span className="text-foreground font-medium">appreciation or reward</span> for the effort, it is accepted with gratitude.
                      </p>
                      <p className="text-muted-foreground/70">
                        Thank you for your understanding and respect.
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
                    onClick={() => setStage('choose')}
                    className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-[12px] active:scale-95 transition-transform"
                  >
                    {isAr ? 'فهمت، متابعة' : 'I understand, continue'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage 2: choose tier — 3x2 grid + bottom confirm */}
          {stage === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div className="bg-card border border-border/30 rounded-2xl p-5 shadow-card">
                <p className="text-[11px] text-muted-foreground/70 mb-4 font-light">
                  {isAr
                    ? 'اختر مبلغ المساهمة (ريال سعودي)'
                    : 'Select your contribution (SAR)'}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {TIERS.map((tier) => {
                    const isSel = selectedSar === tier.sar;
                    return (
                      <button
                        key={tier.priceId}
                        onClick={() => setSelectedSar(tier.sar)}
                        className={`relative py-5 rounded-xl border transition-all active:scale-[0.97] ${
                          isSel
                            ? 'bg-primary/10 border-primary text-foreground'
                            : 'bg-secondary/30 border-border/30 text-foreground hover:border-border/60'
                        }`}
                      >
                        {isSel && (
                          <div className="absolute top-1.5 end-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                          </div>
                        )}
                        <div className="text-[18px] tabular-nums leading-none font-light">{tier.sar}</div>
                        <div className="text-[9px] text-muted-foreground/70 font-light mt-1.5">SAR</div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-muted-foreground/50 text-center font-light mt-4 leading-relaxed">
                  {isAr
                    ? 'يتم الدفع بأمان عبر Paddle. الفاتورة تُولَّد تلقائيًا.'
                    : 'Secure payment via Paddle. Invoice is generated automatically.'}
                </p>
              </div>

              {/* Bottom: back + confirm */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedSar(null); setStage('compliance'); }}
                  className="px-5 py-3.5 rounded-2xl bg-secondary/40 text-foreground text-[13px] active:scale-95 transition-transform"
                >
                  {isAr ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedTier || loading}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground text-[13px] font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isAr ? 'تأكيد' : 'Confirm'}
                      {selectedSar && (
                        <span className="text-[11px] opacity-80 tabular-nums">
                          · {selectedSar} SAR
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SupportPage;
