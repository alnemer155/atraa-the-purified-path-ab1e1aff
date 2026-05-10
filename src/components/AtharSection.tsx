/**
 * Athar (أثر) home-page section.
 * Renders up to 6 quote tiles in a 2×3 grid (mosaic of squares).
 * Each tile has an arrow icon in its corner indicating it opens the
 * external quote detail at https://athar.atraa.xyz/{id}.
 */
import { useEffect, useState } from 'react';
import { ArrowUpLeft } from 'lucide-react';
import { useMadhhab } from '@/lib/madhhab';
import { fetchAtharForMadhhab, ATHAR_PUBLIC_BASE, type AtharQuote } from '@/lib/athar';
import logoAthar from '@/assets/logo-athar.png';

const AtharSection = () => {
  const madhhab = useMadhhab();
  const [items, setItems] = useState<AtharQuote[]>([]);

  useEffect(() => {
    void (async () => setItems(await fetchAtharForMadhhab(madhhab, 6)))();
  }, [madhhab]);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <img src={logoAthar} alt="" className="h-3.5 w-auto opacity-70" />
          <h2 className="text-[12px] text-foreground text-right">أثر</h2>
        </div>
        <span className="text-[8px] text-muted-foreground/40 font-light tabular-nums">
          {items.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5" dir="rtl">
        {items.map((q) => (
          <a
            key={q.id}
            href={`${ATHAR_PUBLIC_BASE}/${q.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square relative rounded-2xl border border-border/30 bg-card p-3 flex flex-col justify-between active:bg-secondary/30 transition-colors text-right overflow-hidden"
          >
            <p className="text-[11px] text-foreground leading-relaxed line-clamp-4 font-light">
              {q.text}
            </p>
            <p className="text-[9px] text-muted-foreground/70 font-light truncate mt-1">
              {q.sayer}
            </p>
            <ArrowUpLeft
              className="absolute top-2 left-2 w-3 h-3 text-muted-foreground/40"
              strokeWidth={1.5}
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default AtharSection;
