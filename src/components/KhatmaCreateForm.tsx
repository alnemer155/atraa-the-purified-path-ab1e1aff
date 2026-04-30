import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Check, Loader2, BookMarked, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SURAHS } from '@/lib/surahs-list';
import { toast } from '@/hooks/use-toast';
import {
  generateCreatorToken,
  rememberCreator,
  DURATION_OPTIONS,
  khatmaShareUrl,
  isOnKhatmaSubdomain,
} from '@/lib/khatma-creator';

type Mode = 'surah' | 'full_quran';

interface Props {
  onClose?: () => void;
  onCreated?: () => void;
  embedded?: boolean; // when true: render inline (no full-screen overlay)
}

const KhatmaCreateForm = ({ onClose, onCreated, embedded = false }: Props) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('surah');
  const [title, setTitle] = useState('');
  const [surahNumber, setSurahNumber] = useState<number>(36);
  const [durationHours, setDurationHours] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);

  async function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      toast({ title: 'الرجاء كتابة العنوان', variant: 'destructive' });
      return;
    }
    if (trimmed.length < 4) {
      toast({ title: 'العنوان قصير جداً', variant: 'destructive' });
      return;
    }

    setVerifying(true);
    setCountdown(30);
    const startedAt = Date.now();
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setCountdown(Math.max(0, 30 - elapsed));
    }, 250);

    const surah = SURAHS.find(s => s.number === surahNumber);
    const verifyPromise = supabase.functions.invoke('verify-khatma-title', {
      body: { title: trimmed },
    });
    const waitPromise = new Promise(r => setTimeout(r, 30_000));

    try {
      const [{ data, error }] = await Promise.all([verifyPromise, waitPromise]);
      clearInterval(tick);
      if (error) throw error;
      const result = data as { ok: boolean; cleaned_title: string; reason: string };

      if (!result.ok) {
        toast({ title: 'لم يُقبل العنوان', description: result.reason || 'الرجاء مراجعة الصياغة', variant: 'destructive' });
        setVerifying(false);
        return;
      }

      const creatorToken = generateCreatorToken();
      const expiresAt = durationHours
        ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
        : null;

      const insertPayload = mode === 'surah'
        ? {
            title: result.cleaned_title,
            mode: 'surah',
            surah_number: surahNumber,
            surah_name: surah?.name ?? '',
            is_published: true,
            verified_at: new Date().toISOString(),
            creator_token: creatorToken,
            expires_at: expiresAt,
          }
        : {
            title: result.cleaned_title,
            mode: 'full_quran',
            surah_number: null,
            surah_name: null,
            is_published: true,
            verified_at: new Date().toISOString(),
            creator_token: creatorToken,
            expires_at: expiresAt,
          };

      const { data: inserted, error: insertErr } = await supabase
        .from('khatmas')
        .insert(insertPayload as never)
        .select()
        .single();

      if (insertErr) throw insertErr;
      rememberCreator(inserted.id, creatorToken);

      toast({ title: 'تم نشر الختمة' });
      setTitle('');
      setDurationHours(null);
      setVerifying(false);
      onCreated?.();

      // Navigate to khatma — internal route, regardless of host.
      if (isOnKhatmaSubdomain()) {
        navigate(`/${inserted.slug}`);
      } else {
        navigate(`/khatma/${inserted.slug}`);
      }
    } catch (e) {
      clearInterval(tick);
      console.error(e);
      toast({ title: 'تعذّر إنشاء الختمة', description: e instanceof Error ? e.message : '', variant: 'destructive' });
      setVerifying(false);
    }
  }

  const Body = (
    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
      {/* Mode picker */}
      <div>
        <label className="text-[11px] text-muted-foreground block mb-2">نوع الختمة</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('surah')}
            disabled={verifying}
            className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-colors ${
              mode === 'surah'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary/40 text-foreground border-border/30'
            } disabled:opacity-50`}
          >
            <BookMarked className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[11px]">سورة واحدة</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('full_quran')}
            disabled={verifying}
            className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-colors ${
              mode === 'full_quran'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary/40 text-foreground border-border/30'
            } disabled:opacity-50`}
          >
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[11px]">قرآن كامل · ٣٠ جزء</span>
          </button>
        </div>
      </div>

      {/* Surah picker — only for surah mode */}
      {mode === 'surah' && (
        <div>
          <label className="text-[11px] text-muted-foreground block mb-2">السورة</label>
          <select
            value={surahNumber}
            onChange={(e) => setSurahNumber(parseInt(e.target.value, 10))}
            disabled={verifying}
            className="w-full h-12 px-3 rounded-xl bg-secondary/40 border border-border/30 text-[14px] text-foreground text-right disabled:opacity-50"
          >
            {SURAHS.map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. سورة {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'full_quran' && (
        <div className="rounded-xl bg-secondary/30 border border-border/30 p-3">
          <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
            ختمة كاملة تتكوّن من ٣٠ جزءاً. يمكن للقرّاء حجز الأجزاء واحداً تلو الآخر، وتكتمل عند ختم جميع الأجزاء الـ٣٠.
          </p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="text-[11px] text-muted-foreground block mb-2">العنوان / الإهداء</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={verifying}
          maxLength={150}
          rows={3}
          placeholder="مثال: إهداء إلى روح المرحوم محمد بن علي"
          className="w-full px-3 py-3 rounded-xl bg-secondary/40 border border-border/30 text-[13px] text-foreground text-right resize-none placeholder:text-muted-foreground/40 disabled:opacity-50"
        />
        <p className="text-[10px] text-muted-foreground/60 mt-2 font-light leading-relaxed">
          لا تستخدم الألقاب (الشيخ، الحاج، السيد، الدكتور...). اكتفِ بـ "المرحوم/المرحومة" + الاسم + اسم الأب.
        </p>
      </div>

      {/* Duration */}
      <div>
        <label className="text-[11px] text-muted-foreground block mb-2">
          مدة الختمة <span className="text-muted-foreground/50">(اختياري)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setDurationHours(null)}
            disabled={verifying}
            className={`h-11 rounded-xl text-[11px] border transition-colors ${
              durationHours === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary/40 text-foreground border-border/30'
            } disabled:opacity-50`}
          >
            دائمة
          </button>
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.hours}
              type="button"
              onClick={() => setDurationHours(opt.hours)}
              disabled={verifying}
              className={`h-11 rounded-xl text-[11px] border transition-colors ${
                durationHours === opt.hours
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/40 text-foreground border-border/30'
              } disabled:opacity-50`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {verifying && (
        <div className="rounded-xl bg-secondary/30 border border-border/30 p-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-foreground">جارٍ التحقق من الصياغة</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1 tabular-nums">
              تبقّى {countdown} ثانية
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const Footer = (
    <div className="px-5 pb-6 pt-2 border-t border-border/20">
      <button
        onClick={handleSubmit}
        disabled={verifying || !title.trim()}
        className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[13px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
      >
        {verifying ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحقق...</>
        ) : (
          <><Check className="w-4 h-4" /> نشر الختمة</>
        )}
      </button>
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden flex flex-col" dir="rtl">
        {Body}
        {Footer}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
      dir="rtl"
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/30">
        <button
          onClick={() => !verifying && onClose?.()}
          disabled={verifying}
          className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 disabled:opacity-30"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <h2 className="text-[14px] text-foreground">ختمة جديدة</h2>
        <div className="w-9" />
      </div>
      {Body}
      {Footer}
    </motion.div>
  );
};

export { khatmaShareUrl };
export default KhatmaCreateForm;
