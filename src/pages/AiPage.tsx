import { Bot, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AiPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl islamic-gradient flex items-center justify-center shadow-elevated">
          <Bot className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-3">ذكاء عِتَرَةً</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-primary" />
          <p className="text-base font-medium text-primary">قريباً</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          المساعد الذكي للأسئلة الدينية والإسلامية سيكون متاحاً في التحديث القادم بإذن الله.
        </p>
      </motion.div>
    </div>
  );
};

export default AiPage;
