import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: ReactNode;
}

const LegalLayout = ({ title, updated, children }: LegalLayoutProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const Back = isAr ? ArrowRight : ArrowLeft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`px-4 py-4 pb-24 ${isAr ? 'text-right' : 'text-left'}`}
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] text-primary mb-3"
      >
        <Back className="w-4 h-4" />
        <span>{t('common.back')}</span>
      </button>

      <h1 className="text-[20px] text-foreground font-semibold mb-1">{title}</h1>
      <p className="text-[10px] text-muted-foreground mb-5">{updated}</p>

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-card space-y-4 text-[13px] leading-relaxed text-foreground/90">
        {children}
      </div>
    </motion.div>
  );
};

export default LegalLayout;
