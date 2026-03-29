import { Bot, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AiPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-xs"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl islamic-gradient flex items-center justify-center shadow-elevated">
          <Bot className="w-9 h-9 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">ذكاء عِتَرَةً</h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 mb-4">
          <Sparkles className="w-3 h-3 text-primary" />
          <p className="text-xs font-semibold text-primary">قريباً</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          المساعد الذكي للأسئلة الدينية والإسلامية سيكون متاحاً في التحديث القادم بإذن الله.
        </p>
      </motion.div>
    </div>
  );
};

export default AiPage;
