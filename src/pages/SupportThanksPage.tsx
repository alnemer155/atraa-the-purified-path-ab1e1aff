import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ThanksPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tierSar = params.get('tier');

  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll for the most recent invoice (webhook may take a few seconds)
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      while (!cancelled && attempts < maxAttempts) {
        attempts++;
        const { data } = await supabase
          .from('invoices')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Check if this invoice was created in the last 60 seconds
        if (data?.id) {
          const { data: full } = await supabase
            .from('invoices')
            .select('id, created_at')
            .eq('id', data.id)
            .maybeSingle();

          if (full && Date.now() - new Date(full.created_at).getTime() < 60000) {
            if (!cancelled) {
              setInvoiceId(data.id);
              setLoading(false);
              return;
            }
          }
        }

        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setLoading(false);
    };

    poll();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 bg-background ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border/30 rounded-2xl p-7 shadow-card text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Heart className="w-7 h-7 text-primary" strokeWidth={1.5} fill="currentColor" />
        </motion.div>

        <h1 className="text-[16px] text-foreground font-medium mb-2">
          {isAr ? 'جزاكم الله خيراً' : 'May Allah reward you'}
        </h1>
        <p className="text-[12px] text-muted-foreground/70 font-light leading-relaxed mb-1">
          {isAr
            ? 'تمّ استلام مساهمتك بنجاح، نسأل الله أن يبارك لكم في عمركم ومالكم.'
            : 'Your contribution was received. May Allah bless you in your time and wealth.'}
        </p>

        {tierSar && (
          <p className="text-[11px] text-muted-foreground/50 font-light tabular-nums mt-3">
            {tierSar} SAR
          </p>
        )}

        <div className="mt-6 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-2.5 text-[11px] text-muted-foreground/60">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {isAr ? 'جارٍ إصدار الفاتورة...' : 'Generating your invoice...'}
            </div>
          ) : invoiceId ? (
            <Link
              to={`/invoice/${invoiceId}`}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-foreground text-background text-[12px] active:scale-95 transition-transform"
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
              {isAr ? 'عرض الفاتورة' : 'View invoice'}
            </Link>
          ) : (
            <p className="text-[10px] text-muted-foreground/50 font-light">
              {isAr
                ? 'الفاتورة قد تأخذ بضع ثوانٍ. ستصلك عبر البريد أيضًا.'
                : 'Invoice may take a moment. It will also be emailed to you.'}
            </p>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-2 text-[11px] text-muted-foreground/60 active:text-foreground transition-colors"
          >
            {isAr ? 'العودة للرئيسية' : 'Back to home'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ThanksPage;
