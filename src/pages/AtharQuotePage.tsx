/**
 * Athar quote detail page — /athar/:id (and legacy athar.atraa.xyz/:id).
 * v2.12.47 — redesigned: copy, share, save, and image export.
 */
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Share2, Download, Copy, Bookmark, ChevronRight } from 'lucide-react';
import {
  fetchAtharById,
  atharShareUrl,
  isAtharSaved,
  toggleAtharSaved,
  type AtharQuote,
} from '@/lib/athar';
import logoAthar from '@/assets/logo-athar.png';
import { toast } from '@/hooks/use-toast';

const AtharQuotePage = () => {
  const { id } = useParams();
  const [quote, setQuote] = useState<AtharQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      if (!id) return;
      setQuote(await fetchAtharById(id));
      setSaved(isAtharSaved(id));
      setLoading(false);
    })();
  }, [id]);

  const buildImageBlob = async (): Promise<Blob | null> => {
    if (!quote) return null;
    const W = 1080, H = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f5efe6'; ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#2b1d10'; ctx.textAlign = 'right'; ctx.direction = 'rtl';
    ctx.font = '300 44px "Qomra Arabic", system-ui';
    const words = quote.text.split(' ');
    const lines: string[] = []; let line = '';
    const maxW = W - 160;
    words.forEach((w) => {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    const startY = H / 2 - (lines.length * 60) / 2 - 40;
    lines.forEach((ln, i) => ctx.fillText(ln, W - 80, startY + i * 60));

    ctx.font = '300 30px "Qomra Arabic", system-ui';
    ctx.fillStyle = '#6b5840';
    ctx.fillText(`— ${quote.sayer}`, W - 80, startY + lines.length * 60 + 40);

    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = logoAthar;
    await new Promise((r) => { img.onload = r; img.onerror = r; });
    const wmSize = 110;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(img, (W - wmSize) / 2, H - wmSize - 90, wmSize, wmSize);
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.font = '300 22px "Qomra Arabic", system-ui';
    ctx.fillStyle = '#3a2c1a';
    ctx.fillText('أثر · منصة عترة الدينية', W / 2, H - 50);

    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/png')!,
    );
  };

  const downloadAsImage = async () => {
    try {
      const blob = await buildImageBlob();
      if (!blob || !quote) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `athar-${quote.id}.png`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'تم تحميل الصورة' });
    } catch {
      toast({ title: 'تعذّر إنشاء الصورة', variant: 'destructive' });
    }
  };

  const copyText = async () => {
    if (!quote) return;
    const body = `${quote.text}\n— ${quote.sayer}${quote.source ? `\nالمصدر: ${quote.source}` : ''}\n${atharShareUrl(quote.id)}`;
    try {
      await navigator.clipboard.writeText(body);
      toast({ title: 'تم نسخ المقولة' });
    } catch {
      toast({ title: 'تعذّر النسخ', variant: 'destructive' });
    }
  };

  const handleSave = () => {
    if (!quote) return;
    const now = toggleAtharSaved(quote.id);
    setSaved(now);
    toast({ title: now ? 'أُضيفت للمحفوظات' : 'أُزيلت من المحفوظات' });
  };

  const shareLink = async () => {
    if (!quote) return;
    const url = atharShareUrl(quote.id);
    try {
      const blob = await buildImageBlob();
      const file = blob ? new File([blob], `athar-${quote.id}.png`, { type: 'image/png' }) : null;
      const navAny = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (file && navAny.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ title: 'أثر', text: quote.text, url, files: [file] } as ShareData);
        return;
      }
      if (navigator.share) { await navigator.share({ title: 'أثر', text: quote.text, url }); return; }
      await navigator.clipboard.writeText(url);
      toast({ title: 'تم نسخ الرابط' });
    } catch { /* cancelled */ }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!quote) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background px-6 text-center gap-4" dir="rtl">
        <p className="text-[13px] text-muted-foreground font-light">
          لم يُعثر على هذه المقولة. تحقق من الرابط.
        </p>
        <Link to="/athar" className="text-[12px] text-foreground underline-offset-4 underline">
          العودة إلى أثر
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background px-5 py-7 max-w-xl mx-auto animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src={logoAthar} alt="" className="h-5 w-auto opacity-80" />
          <p className="text-[12px] text-foreground/85 font-light">أثر · منصة عترة</p>
        </div>
        <Link
          to="/athar"
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70"
        >
          كل المقولات <ChevronRight className="w-3 h-3" strokeWidth={1.6} />
        </Link>
      </div>

      <div ref={cardRef} className="rounded-3xl glass-card-soft border border-border/25 p-6 mb-3">
        <div className="h-[0.5px] w-10 bg-gold/50 mb-5" />
        <p className="text-[16px] text-foreground leading-loose font-light text-right">
          {quote.text}
        </p>
        <div className="mt-5 pt-5 border-t border-border/20 space-y-2 text-right">
          <p className="text-[13px] text-foreground">{quote.sayer}</p>
          {quote.sayer_info && (
            <p className="text-[11px] text-muted-foreground font-light leading-relaxed">{quote.sayer_info}</p>
          )}
          {quote.source && (
            <p className="text-[11px] text-muted-foreground/80 font-light">المصدر: {quote.source}</p>
          )}
          {quote.interpretation && (
            <div className="mt-3 pt-3 border-t border-border/10">
              <p className="text-[10px] text-muted-foreground/60 mb-1">التفسير</p>
              <p className="text-[12px] text-foreground/80 font-light leading-relaxed">{quote.interpretation}</p>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/50 mt-3 tabular-nums">ID: {quote.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={shareLink} className="h-12 rounded-2xl bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
          <Share2 className="w-4 h-4" strokeWidth={1.5} /> مشاركة
        </button>
        <button onClick={copyText} className="h-12 rounded-2xl bg-secondary/40 border border-border/25 text-foreground text-[12px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
          <Copy className="w-4 h-4" strokeWidth={1.5} /> نسخ
        </button>
        <button onClick={handleSave} className="h-12 rounded-2xl bg-secondary/40 border border-border/25 text-foreground text-[12px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
          <Bookmark className={`w-4 h-4 ${saved ? 'text-gold fill-current' : ''}`} strokeWidth={1.5} />
          {saved ? 'محفوظة' : 'حفظ'}
        </button>
        <button onClick={downloadAsImage} className="h-12 rounded-2xl bg-secondary/40 border border-border/25 text-foreground text-[12px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
          <Download className="w-4 h-4" strokeWidth={1.5} /> صورة
        </button>
      </div>
    </div>
  );
};

export default AtharQuotePage;
