/**
 * Athar (أثر) home-page section.
 * v2.12.47 — links to the internal /athar page (platform merge).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAthar, type AtharQuote } from '@/lib/athar';
import logoAthar from '@/assets/logo-athar.png';

const AtharSection = () => {
  const [items, setItems] = useState<AtharQuote[]>([]);

  useEffect(() => {
    void (async () => setItems(await fetchAthar(5)))();
  }, []);

  if (items.length === 0) return null;

  const hero = items[0];
  const rest = items.slice(1, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <img src={logoAthar} alt="" className="h-3 w-auto opacity-70" />
          <h2 className="text-[13px] font-bold text-foreground">أثر</h2>
        </div>
        <Link
          to="/athar"
          className="text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          المزيد
        </Link>
      </div>

      {/* Hero quote — centered, hairline dividers */}
      <Link
        to={`/athar/${hero.id}`}
        className="block py-6 text-center space-y-4 active:opacity-70 transition-opacity"
      >
        <div className="h-[0.5px] w-12 bg-gold/40 mx-auto" />
        <p className="text-foreground text-[15px] font-medium leading-loose px-6 max-w-md mx-auto">
          {hero.text}
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/8 hairline-gold border-[0.5px]">
          <span className="text-gold text-[10px] font-bold tracking-widest">— {hero.sayer}</span>
        </div>
      </Link>

      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-2" dir="rtl">
          {rest.map((q) => (
            <Link
              key={q.id}
              to={`/athar/${q.id}`}
              className="aspect-square rounded-2xl glass-card-soft p-2.5 flex flex-col justify-between active:scale-[0.97] transition-transform text-right overflow-hidden"
            >
              <p className="text-[9px] text-foreground leading-snug line-clamp-4">
                {q.text}
              </p>
              <p className="text-[7px] text-gold font-bold truncate mt-1">
                {q.sayer}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AtharSection;
