import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initializePaddle, getPaddlePriceId } from '@/lib/paddle';
import { PaymentTestModeBanner } from '@/components/PaymentTestModeBanner';
import { toast } from 'sonner';

type Tier = {
  priceId: string;
  sar: number;
  label?: 'popular' | 'generous';
};

const TIERS: Tier[] = [
  { priceId: 'support_sar_10', sar: 10 },
  { priceId: 'support_sar_25', sar: 25 },
  { priceId: 'support_sar_50', sar: 50, label: 'popular' },
  { priceId: 'support_sar_100', sar: 100 },
  { priceId: 'support_sar_250', sar: 250 },
  { priceId: 'support_sar_500', sar: 500, label: 'generous' },
];

type Stage = 'compliance' | 'choose';

const SupportPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [stage, setStage] = useState<Stage>('compliance');
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleSupport = async (tier: Tier) => {
    if (loadingPriceId) return;
    setLoadingPriceId(tier.priceId);

    try {
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(tier.priceId);

      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customData: {
          source: 'atraa_support_page',
          tier_sar: String(tier.sar),
        },
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: isAr ? 'ar' : 'en',
          successUrl: `${window.location.origin}/support/thanks?tier=${tier.sar}`,
          allowLogout: false,
          variant: 'one-page',
        },
      });
    } catch (e) {
      console.error('Checkout error:', e);
      toast.error(isAr ? 'تعذّر فتح صفحة الدفع' : 'Could not open checkout');
    } finally {
      setLoadingPriceId(null);
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

          {/* Stage 2: choose tier */}
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
                    ? 'اختر مبلغ المساهمة (ريال سعودي) — يتم الدفع بأمان عبر Paddle'
                    : 'Select your contribution (SAR) — secure payment via Paddle'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {TIERS.map((tier) => {
                    const isLoading = loadingPriceId === tier.priceId;
                    return (
                      <button
                        key={tier.priceId}
                        onClick={() => handleSupport(tier)}
                        disabled={!!loadingPriceId}
                        className={`relative py-4 rounded-xl text-foreground border transition-all active:scale-[0.97] disabled:opacity-50 ${
                          tier.label === 'popular'
                            ? 'bg-primary/8 border-primary/30'
                            : tier.label === 'generous'
                            ? 'bg-accent/8 border-accent/30'
                            : 'bg-secondary/30 border-border/20'
                        }`}
                      >
                        {tier.label === 'popular' && (
                          <span className="absolute -top-1.5 start-2 text-[8px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-light">
                            {isAr ? 'الأكثر' : 'Popular'}
                          </span>
                        )}
                        {tier.label === 'generous' && (
                          <span className="absolute -top-1.5 start-2 text-[8px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground font-light flex items-center gap-0.5">
                            <Sparkles className="w-2 h-2" strokeWidth={2} />
                            {isAr ? 'كريم' : 'Generous'}
                          </span>
                        )}
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mx-auto animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <div className="text-[18px] tabular-nums leading-none">{tier.sar}</div>
                            <div className="text-[9px] text-muted-foreground/60 font-light mt-1">SAR</div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-muted-foreground/50 text-center font-light mt-4 leading-relaxed">
                  {isAr
                    ? 'الفاتورة تُرسل تلقائيًا بعد إتمام الدفع، ويمكنك تنزيلها بصيغة PDF.'
                    : 'Invoice is generated automatically after payment, downloadable as PDF.'}
                </p>
              </div>

              <button
                onClick={() => setStage('compliance')}
                className="w-full py-2.5 rounded-xl bg-secondary/40 text-foreground text-[12px] active:scale-95 transition-transform"
              >
                {isAr ? 'رجوع' : 'Back'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SupportPage;
