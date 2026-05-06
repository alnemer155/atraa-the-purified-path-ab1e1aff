/**
 * AI-verified reader-name dialog for khatma recitation registration.
 * - User enters triple name (first + father + family) in Arabic
 * - Chooses public / private (private visible only to creator + dev)
 * - Can bypass by typing exactly "تخطي ذلك"
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Globe, Lock, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (params: { name: string; isPrivate: boolean; skipped: boolean }) => Promise<void> | void;
}

const RecitationRegisterDialog = ({ open, onClose, onConfirm }: Props) => {
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    const trimmed = name.trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      toast({ title: 'الرجاء كتابة الاسم أو "تخطي ذلك"', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-reader-name', {
        body: { name: trimmed },
      });
      if (error) throw error;
      const result = data as { ok: boolean; cleaned_name: string; skipped: boolean; reason: string };
      if (!result.ok) {
        toast({ title: 'لم يُقبل الاسم', description: result.reason, variant: 'destructive' });
        setBusy(false);
        return;
      }
      await onConfirm({ name: result.cleaned_name, isPrivate, skipped: result.skipped });
      setName(''); setIsPrivate(false); setBusy(false);
      onClose();
    } catch (e) {
      console.error(e);
      toast({ title: 'تعذّر التحقق', variant: 'destructive' });
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" dir="rtl">
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md rounded-3xl border border-border/30 bg-card p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <p className="text-[14px] text-foreground">تسجيل القراءة</p>
          <button onClick={() => !busy && onClose()} className="w-8 h-8 rounded-full active:bg-secondary/40 flex items-center justify-center">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/80 font-light leading-relaxed mb-3">
          اكتب اسمك الثلاثي بالعربية (الاسم + الأب + العائلة) لتسجيل قراءتك.
          يُتحقَّق منه آلياً بواسطة الذكاء الاصطناعي.
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          placeholder='مثال: محمد علي الحسيني — أو اكتب "تخطي ذلك"'
          className="w-full h-12 px-3 rounded-xl bg-secondary/40 border border-border/30 text-[13px] text-right placeholder:text-muted-foreground/40 outline-none disabled:opacity-50"
        />

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={() => setIsPrivate(false)}
            disabled={busy}
            className={`h-12 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] ${!isPrivate ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/40 border-border/30 text-foreground'}`}
          >
            <Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> علناً
          </button>
          <button
            type="button"
            onClick={() => setIsPrivate(true)}
            disabled={busy}
            className={`h-12 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] ${isPrivate ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/40 border-border/30 text-foreground'}`}
          >
            <Lock className="w-3.5 h-3.5" strokeWidth={1.5} /> خاص
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-2 font-light leading-relaxed">
          {isPrivate ? 'يظهر فقط للمنشئ والمطوّر.' : 'يظهر اسمك لكل من يفتح الختمة.'}
        </p>

        <button
          onClick={submit}
          disabled={busy || !name.trim()}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[13px] flex items-center justify-center gap-2 mt-4 disabled:opacity-40"
        >
          {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحقق...</>) : (<><Check className="w-4 h-4" /> تأكيد القراءة</>)}
        </button>
      </motion.div>
    </div>
  );
};

export default RecitationRegisterDialog;
