import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Plus, ChevronLeft, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SURAHS } from '@/lib/surahs-list';
import { toast } from '@/hooks/use-toast';
import { generateCreatorToken, rememberCreator, DURATION_OPTIONS } from '@/lib/khatma-creator';

interface Khatma {
  id: string;
  slug: string;
  title: string;
  surah_number: number;
  surah_name: string;
  recitations_count: number;
  created_at: string;
}

const KhatmaSection = () => {
  const navigate = useNavigate();
  const [recent, setRecent] = useState<Khatma[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [surahNumber, setSurahNumber] = useState<number>(36); // Yasin default
  const [durationHours, setDurationHours] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    void loadRecent();
  }, []);

  async function loadRecent() {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from('khatmas')
      .select('*')
      .eq('is_published', true)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setRecent(data as Khatma[]);
  }

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

    // Visible 30s countdown for the user (AI verification window)
    const startedAt = Date.now();
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, 30 - elapsed);
      setCountdown(left);
    }, 250);

    // Run AI verification + 30s minimum wait in parallel
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

      const { data: inserted, error: insertErr } = await supabase
        .from('khatmas')
        .insert({
          title: result.cleaned_title,
          surah_number: surahNumber,
          surah_name: surah?.name ?? '',
          is_published: true,
          verified_at: new Date().toISOString(),
          creator_token: creatorToken,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      rememberCreator(inserted.id, creatorToken);

      toast({ title: 'تم نشر الختمة' });
      setShowCreate(false);
      setTitle('');
      setDurationHours(null);
      setVerifying(false);
      void loadRecent();
      navigate(`/khatma/${inserted.slug}`);
    } catch (e) {
      clearInterval(tick);
      console.error(e);
      toast({ title: 'تعذّر إنشاء الختمة', description: e instanceof Error ? e.message : '', variant: 'destructive' });
      setVerifying(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[12px] text-foreground text-right">الختمات</h2>
        <span className="text-[8px] text-muted-foreground/40 font-light tabular-nums">
          {recent.length} منشورة
        </span>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-3 p-3.5 active:bg-secondary/40 transition-colors text-right"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Plus className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground">إنشاء ختمة جديدة</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-light">اختر سورة، اكتب الإهداء، وانشره</p>
          </div>
          <BookMarked className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
        </button>

        {recent.length > 0 && (
          <div className="border-t border-border/20">
            {recent.map((k) => (
              <Link
                key={k.id}
                to={`/khatma/${k.slug}`}
                className="flex items-center gap-3 p-3 border-b border-border/10 last:border-b-0 active:bg-secondary/30 transition-colors"
              >
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[12px] text-foreground truncate">{k.title}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5 tabular-nums">
                    سورة {k.surah_name} · {k.recitations_count} قراءة
                  </p>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
            dir="rtl"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/30">
              <button
                onClick={() => !verifying && setShowCreate(false)}
                disabled={verifying}
                className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 disabled:opacity-30"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <h2 className="text-[14px] text-foreground">ختمة جديدة</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {/* Surah picker */}
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

              {/* Duration (optional) */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KhatmaSection;
