import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, MessageCircle, RefreshCw } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const contactSubject = encodeURIComponent('مشكلة في الموقع - صفحة غير موجودة');
  const contactBody = encodeURIComponent(`مرحباً،\n\nواجهت مشكلة في الوصول إلى الرابط التالي:\n${window.location.href}\n\nيرجى المساعدة.`);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm w-full"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-[2rem] islamic-gradient shadow-elevated mb-4">
            <span className="text-5xl font-black text-primary-foreground tracking-tight">٤٠٤</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-xl font-bold text-foreground mb-2">صفحة غير موجودة</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            هلابك 👋🏻 يمكن حصلت رابط غلط أو في مشكلة في الموقع.
            <br />
            إذا استمرّت المشكلة{' '}
            <button
              onClick={() => setShowContact(true)}
              className="text-primary font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              اضغط هنا
            </button>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-2.5"
        >
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl islamic-gradient text-primary-foreground font-bold text-sm shadow-card active:scale-[0.97] transition-transform"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </a>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-card border border-border/40 text-foreground font-medium text-sm hover:bg-secondary/40 active:scale-[0.97] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة تحميل الصفحة
          </button>
        </motion.div>

        {/* Quick Contact Modal */}
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm px-5"
            onClick={() => setShowContact(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-3xl p-5 shadow-elevated max-w-sm w-full border border-border/30"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-base font-bold text-foreground mb-1 text-center">التواصل السريع</h2>
              <p className="text-[11px] text-muted-foreground text-center mb-4">اختر طريقة التواصل المناسبة</p>

              <div className="space-y-2">
                <a
                  href={`mailto:a.jaafar.dev@gmail.com?subject=${contactSubject}&body=${contactBody}`}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/40 hover:bg-secondary/60 transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-foreground">البريد الإلكتروني</p>
                    <p className="text-[10px] text-muted-foreground">a.jaafar.dev@gmail.com</p>
                  </div>
                </a>

                <a
                  href="https://whatsapp.com/channel/0029VbCNwblJZg466AM5CC2R"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/40 hover:bg-secondary/60 transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <span className="text-lg">💬</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-foreground">قناة واتساب</p>
                    <p className="text-[10px] text-muted-foreground">قــناة عِتْرَةً</p>
                  </div>
                </a>
              </div>

              <button
                onClick={() => setShowContact(false)}
                className="w-full mt-4 py-2.5 rounded-xl bg-secondary/60 text-foreground text-sm font-medium active:scale-[0.98] transition-transform"
              >
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[9px] text-muted-foreground/40 mt-8"
        >
          عِتَرَةً · v3.3
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;
