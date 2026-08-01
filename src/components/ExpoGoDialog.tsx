import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ExternalLink, Copy, Check, RefreshCw, AlertTriangle, Apple } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// v2.13.40 — Expo Go preview launcher (OTA channel).
// Update these values whenever a new preview build is published.
export const EXPO_PREVIEW = {
  expUrl: 'exp://u.expo.dev/update/atraa-preview?channel-name=preview&runtime-version=exposdk:52.0.0',
  webUrl: 'https://expo.dev/preview/atraa',
  version: 'v2.13.40',
  build: '410',
  updatedAt: '2026-07-20',
};

const STORE_LINKS = {
  ios: 'https://apps.apple.com/app/expo-go/id982107779',
  android: 'https://play.google.com/store/apps/details?id=host.exp.exponent',
};

const qrSrc = (data: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(data)}`;

interface Props {
  open: boolean;
  onClose: () => void;
}

const ExpoGoDialog = ({ open, onClose }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [copied, setCopied] = useState(false);
  const [nonce, setNonce] = useState(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EXPO_PREVIEW.expUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  };

  const openExp = () => {
    // On mobile, exp:// deep-links directly into Expo Go if installed.
    window.location.href = EXPO_PREVIEW.expUrl;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={`relative w-full sm:max-w-md bg-card border border-border/50 rounded-t-3xl sm:rounded-3xl shadow-card overflow-hidden ${isAr ? 'text-right' : 'text-left'}`}
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-primary" strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-[14px] text-foreground font-semibold leading-tight">
                    {isAr ? 'تطبيق Expo Go' : 'Expo Go App'}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {isAr ? 'النسخة التجريبية من عِتْرَة' : 'Atraa preview build'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary/50 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-4">
              {/* QR code */}
              <div className="bg-secondary/30 rounded-2xl p-4 flex flex-col items-center gap-3">
                <div className="bg-white rounded-xl p-2 shadow-sm">
                  <img
                    key={nonce}
                    src={qrSrc(EXPO_PREVIEW.expUrl)}
                    alt="Expo Go QR"
                    className="w-[200px] h-[200px] block"
                    loading="lazy"
                  />
                </div>
                <p className="text-[10.5px] text-muted-foreground/80 text-center leading-relaxed max-w-[240px]">
                  {isAr
                    ? 'امسح الرمز عبر تطبيق Expo Go لفتح النسخة التجريبية مباشرة.'
                    : 'Scan with Expo Go to launch the preview directly.'}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={openExp}
                  className="h-10 rounded-xl bg-primary text-primary-foreground text-[12px] font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isAr ? 'فتح في Expo Go' : 'Open in Expo Go'}
                </button>
                <button
                  onClick={copy}
                  className="h-10 rounded-xl bg-secondary/60 text-foreground text-[12px] font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform border border-border/40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  {isAr ? (copied ? 'تم النسخ' : 'نسخ الرابط') : (copied ? 'Copied' : 'Copy link')}
                </button>
              </div>

              {/* Direct link display */}
              <div className="rounded-xl border border-border/40 bg-secondary/20 px-3 py-2.5">
                <p className="text-[9.5px] text-muted-foreground/70 mb-1 font-medium">
                  {isAr ? 'الرابط المباشر' : 'Direct link'}
                </p>
                <p dir="ltr" className="text-[11px] text-foreground font-mono break-all leading-relaxed">
                  {EXPO_PREVIEW.expUrl}
                </p>
              </div>

              {/* Install Expo Go */}
              <div className="rounded-2xl border border-border/40 p-3.5 space-y-2.5">
                <p className="text-[12px] text-foreground font-medium">
                  {isAr ? 'لا يوجد Expo Go؟' : 'No Expo Go?'}
                </p>
                <p className="text-[10.5px] text-muted-foreground/80 leading-relaxed">
                  {isAr
                    ? 'ثبّت التطبيق مجاناً من متجر جهازك ثم عد وامسح الرمز.'
                    : 'Install the free app from your device store, then scan the code.'}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={STORE_LINKS.ios}
                    target="_blank" rel="noreferrer"
                    className="h-9 rounded-lg bg-secondary/50 border border-border/40 flex items-center justify-center gap-1.5 text-[11px] text-foreground active:scale-95 transition-transform"
                  >
                    <Apple className="w-3.5 h-3.5" /> iOS
                  </a>
                  <a
                    href={STORE_LINKS.android}
                    target="_blank" rel="noreferrer"
                    className="h-9 rounded-lg bg-secondary/50 border border-border/40 flex items-center justify-center gap-1.5 text-[11px] text-foreground active:scale-95 transition-transform"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Android
                  </a>
                </div>
              </div>

              {/* Version info */}
              <div className="rounded-2xl border border-border/40 bg-secondary/20 p-3.5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] text-muted-foreground/70 mb-0.5">{isAr ? 'الإصدار' : 'Version'}</p>
                    <p className="text-[11px] text-foreground font-medium tabular-nums">{EXPO_PREVIEW.version}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground/70 mb-0.5">{isAr ? 'البناء' : 'Build'}</p>
                    <p className="text-[11px] text-foreground font-medium tabular-nums">{EXPO_PREVIEW.build}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground/70 mb-0.5">{isAr ? 'التحديث' : 'Updated'}</p>
                    <p className="text-[11px] text-foreground font-medium tabular-nums">{EXPO_PREVIEW.updatedAt}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNonce((n) => n + 1)}
                  className="mt-3 w-full h-9 rounded-lg bg-card border border-border/40 flex items-center justify-center gap-1.5 text-[11px] text-foreground active:scale-95 transition-transform"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isAr ? 'تحديث النسخة التجريبية' : 'Refresh preview'}
                </button>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10.5px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                  {isAr
                    ? 'هذه نسخة تجريبية مخصصة للاختبار، وقد تحتوي على ميزات قيد التطوير أو غير مستقرة.'
                    : 'This is a preview build for testing. It may include unstable or in-progress features.'}
                </p>
              </div>

              <a
                href={EXPO_PREVIEW.webUrl}
                target="_blank" rel="noreferrer"
                className="block text-center text-[10.5px] text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                {isAr ? 'فتح صفحة المشروع على expo.dev ↗' : 'Open project page on expo.dev ↗'}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpoGoDialog;
