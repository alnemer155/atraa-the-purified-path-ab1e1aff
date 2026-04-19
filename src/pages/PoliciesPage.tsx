import { Shield, FileText, Scale, Database, Info, Mail, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PoliciesPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const policies = [
    { icon: Shield, key: 'privacy', label: t('settings.privacy'), path: '/privacy', desc: isAr ? 'كيف نحمي بياناتك' : 'How we protect your data' },
    { icon: FileText, key: 'terms', label: t('settings.terms'), path: '/terms', desc: isAr ? 'شروط استخدام التطبيق' : 'Rules of use' },
    { icon: Scale, key: 'disclaimer', label: t('settings.disclaimer'), path: '/disclaimer', desc: isAr ? 'إخلاء المسؤولية الديني والتقني' : 'Religious & technical disclaimer' },
    { icon: Database, key: 'data', label: t('settings.data'), path: '/data', desc: isAr ? 'ما الذي نجمعه (محلياً فقط)' : 'What we collect (local only)' },
    { icon: Info, key: 'about', label: t('settings.about'), path: '/about', desc: isAr ? 'من نحن وفلسفتنا' : 'About us & philosophy' },
    { icon: Heart, key: 'support', label: t('settings.support'), path: '/support', desc: isAr ? 'ساهم في تطوير عِتَرَةً' : 'Contribute to Atraa' },
  ];

  return (
    <div className="px-4 py-5 animate-fade-in">
      <div className={`mb-5 ${isAr ? 'text-right' : 'text-left'}`}>
        <h1 className="text-lg text-foreground tracking-tight">
          {isAr ? 'السياسات والشروط' : 'Policies & Terms'}
        </h1>
        <p className="text-[10px] text-muted-foreground/50 font-light mt-0.5">
          {isAr ? 'شفافية كاملة · متوافق مع متطلبات App Store' : 'Full transparency · App Store compliant'}
        </p>
      </div>

      <div className="space-y-1.5">
        {policies.map((p, i) => (
          <motion.button
            key={p.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(p.path)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/15 active:scale-[0.98] transition-transform ${isAr ? 'text-right' : 'text-left'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center flex-shrink-0">
              <p.icon className="w-4 h-4 text-foreground/70" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-foreground">{p.label}</p>
              <p className="text-[10px] text-muted-foreground/50 font-light mt-0.5">{p.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-secondary/20 border border-border/10">
        <div className={`flex items-center gap-2 mb-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
          <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
          <p className="text-[11px] text-foreground">
            {isAr ? 'للتواصل والاستفسارات' : 'Contact & inquiries'}
          </p>
        </div>
        <a href="mailto:support@atraa.xyz" className={`block text-[11px] text-foreground/70 font-mono ${isAr ? 'text-right' : 'text-left'}`}>
          support@atraa.xyz
        </a>
      </div>
    </div>
  );
};

export default PoliciesPage;
