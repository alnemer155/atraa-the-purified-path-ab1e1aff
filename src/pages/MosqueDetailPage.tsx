import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MapPin, Navigation, Copy, Check, ExternalLink, Compass, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MOSQUES, haversineKm, isHighTraffic } from '@/data/mosques';

const MosqueDetailPage = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const Chevron = isAr ? ChevronRight : ChevronLeft;
  const navigate = useNavigate();

  const mosque = useMemo(() => MOSQUES.find((m) => m.id === id), [id]);
  const [copied, setCopied] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('atraa_city_coords');
      if (raw) setUserLoc(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  if (!mosque) {
    return (
      <div className="px-4 py-10 text-center text-muted-foreground text-[13px]">
        {isAr ? 'المسجد غير موجود.' : 'Mosque not found.'}
        <div className="mt-4">
          <Link to="/library" className="text-primary text-[12px] underline">
            {isAr ? 'الرجوع للمكتبة' : 'Back to library'}
          </Link>
        </div>
      </div>
    );
  }

  const name = isAr ? mosque.nameAr : mosque.nameEn;
  const city = isAr ? mosque.city : mosque.cityEn;
  const country = isAr ? mosque.country : mosque.countryEn;
  const addressLine = [name, mosque.area, city, country].filter(Boolean).join('، ');
  const distanceKm = userLoc ? haversineKm(userLoc, mosque) : null;

  // Search by full place name so map providers resolve to the actual venue,
  // not a raw coordinate that may be slightly off. Include coords as a bias.
  const searchQuery = [mosque.nameAr, mosque.city, mosque.country].filter(Boolean).join(' ');
  const enQuery = [mosque.nameEn, mosque.cityEn, mosque.countryEn].filter(Boolean).join(', ');
  const q = encodeURIComponent(isAr ? searchQuery : enQuery);
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const amaps = `https://maps.apple.com/?q=${q}&sll=${mosque.lat},${mosque.lng}`;
  const wazee = `https://waze.com/ul?ll=${mosque.lat},${mosque.lng}&navigate=yes&q=${q}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(addressLine);
      setCopied(true);
      toast.success(isAr ? 'تم نسخ العنوان' : 'Address copied');
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(isAr ? 'تعذّر النسخ' : 'Copy failed');
    }
  };

  return (
    <motion.div
      className={`px-4 py-4 pb-24 ${isAr ? 'text-right' : 'text-left'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-[12px] text-muted-foreground mb-3 active:opacity-70"
      >
        <Chevron className="w-4 h-4" />
        <span>{isAr ? 'رجوع' : 'Back'}</span>
      </button>

      {/* Hero card */}
      <div className="bg-card rounded-3xl border border-border/40 shadow-card overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary/80" strokeWidth={1.6} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[16px] text-foreground font-semibold leading-snug">{name}</h1>
              <p className="text-[11px] text-muted-foreground mt-1">
                {city}{mosque.area ? ` · ${mosque.area}` : ''} · {country}
              </p>
              {distanceKm !== null && (
                <p className="text-[10px] text-primary/80 tabular-nums mt-1.5">
                  {distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)} {isAr ? 'كم من موقعك' : 'km from you'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 grid grid-cols-3 divide-x divide-border/30 rtl:divide-x-reverse">
          <a
            href={gmaps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-3 active:bg-secondary/30 transition-colors"
          >
            <Navigation className="w-4 h-4 text-foreground/70" strokeWidth={1.6} />
            <span className="text-[10px] text-muted-foreground">{isAr ? 'الاتجاهات' : 'Directions'}</span>
          </a>
          <button
            onClick={copyAddress}
            className="flex flex-col items-center gap-1 py-3 active:bg-secondary/30 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-foreground/70" strokeWidth={1.6} />}
            <span className="text-[10px] text-muted-foreground">{isAr ? 'نسخ العنوان' : 'Copy address'}</span>
          </button>
          <Link
            to="/qibla"
            className="flex flex-col items-center gap-1 py-3 active:bg-secondary/30 transition-colors"
          >
            <Compass className="w-4 h-4 text-foreground/70" strokeWidth={1.6} />
            <span className="text-[10px] text-muted-foreground">{isAr ? 'القبلة' : 'Qibla'}</span>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 bg-card rounded-3xl border border-border/40 shadow-card overflow-hidden divide-y divide-border/30">
        <div className="p-4">
          <p className="text-[10px] text-muted-foreground/70 mb-1">{isAr ? 'العنوان' : 'Address'}</p>
          <p className="text-[13px] text-foreground leading-relaxed">{addressLine}</p>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground/70 mb-1">{isAr ? 'خط العرض' : 'Latitude'}</p>
            <p className="text-[12px] text-foreground tabular-nums">{mosque.lat.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground/70 mb-1">{isAr ? 'خط الطول' : 'Longitude'}</p>
            <p className="text-[12px] text-foreground tabular-nums">{mosque.lng.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* External map providers */}
      <div className="mt-4 bg-card rounded-3xl border border-border/40 shadow-card overflow-hidden divide-y divide-border/30">
        {[
          { label: isAr ? 'خرائط Google' : 'Google Maps', href: gmaps },
          { label: isAr ? 'خرائط Apple' : 'Apple Maps', href: amaps },
          { label: 'Waze', href: wazee },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 active:bg-secondary/30 transition-colors"
          >
            <p className="text-[13px] text-foreground">{item.label}</p>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40" />
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default MosqueDetailPage;
