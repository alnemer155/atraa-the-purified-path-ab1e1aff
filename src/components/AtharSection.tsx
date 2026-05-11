/**
 * Athar (أثر) home-page section.
 * Shows up to 5 quote tiles + a 6th "more" tile linking to athar.atraa.xyz.
 * Tiles are smaller than the previous design.
 */
import { useEffect, useState } from 'react';
import { ArrowUpLeft, MoreHorizontal } from 'lucide-react';
import { useMadhhab } from '@/lib/madhhab';
import { fetchAtharForMadhhab, ATHAR_PUBLIC_BASE, type AtharQuote } from '@/lib/athar';
import logoAthar from '@/assets/logo-athar.png';

const AtharSection = () => {
  const madhhab = useMadhhab();
  const [items, setItems] = useState<AtharQuote[]>([]);

  useEffect(() => {
    void (async () => setItems(await fetchAtharForMadhhab(madhhab, 5)))();
  }, [madhhab]);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <img src={logoAthar} alt="" className="h-3 w-auto opacity-70" />
          <h2 className="text-[12px] text-foreground text-right">أثر</h2>
        </div>
        <span className="text-[8px] text-muted-foreground/40 font-light tabular-nums">
          {items.length}+
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5" dir="rtl">
        {items.slice(0, 5).map((q) => (
          <a
            key={q.id}
            href={`${ATHAR_PUBLIC_BASE}/${q.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square relative rounded-xl border border-border/30 bg-card p-2 flex flex-col justify-between active:bg-secondary/30 transition-colors text-right overflow-hidden"
          >
            <p className="text-[9px] text-foreground leading-snug line-clamp-4 font-light">
              {q.text}
            </p>
            <p className="text-[7px] text-muted-foreground/70 font-light truncate mt-1">
              {q.sayer}
            </p>
            <ArrowUpLeft
              className="absolute top-1 left-1 w-2.5 h-2.5 text-muted-foreground/40"
              strokeWidth={1.5}
            />
          </a>
        ))}
        <a
          href={ATHAR_PUBLIC_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-square rounded-xl border border-dashed border-border/40 bg-card/40 flex flex-col items-center justify-center gap-1 active:bg-secondary/30 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground/60" strokeWidth={1.5} />
          <span className="text-[9px] text-muted-foreground/70 font-light">المزيد</span>
        </a>
      </div>
    </div>
  );
};

export default AtharSection;
