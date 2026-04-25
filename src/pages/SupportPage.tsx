import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/30 rounded-2xl p-6 shadow-card text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-secondary/40 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-5 h-5 text-muted-foreground/70" strokeWidth={1.5} />
        </div>

        <h2 className="text-[14px] text-foreground font-medium mb-2">
          {isAr ? 'قريبًا' : 'Coming Soon'}
        </h2>

        <p className="text-[12px] leading-relaxed text-muted-foreground/80 font-light max-w-[280px] mx-auto">
          {isAr
            ? 'نعمل حاليًا على تفعيل بوابة دفع آمنة تدعم مدى وApple Pay. ستكون متاحة قريبًا بإذن الله.'
            : 'We are currently activating a secure payment gateway supporting Mada and Apple Pay. It will be available soon, God willing.'}
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2.5 rounded-xl bg-secondary/40 text-foreground text-[12px] active:scale-95 transition-transform"
        >
          {isAr ? 'رجوع' : 'Back'}
        </button>
      </motion.div>
    </div>
  );
};

export default SupportPage;
