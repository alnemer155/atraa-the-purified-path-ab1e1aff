/**
 * Generic "under maintenance" page. Used both for sub-domains that are
 * routed but not yet built (e.g. legacy stubs), and for the global
 * admin-controlled maintenance toggle (with an optional message and
 * scheduled date/time).
 *
 * Icon-only design (no emoji); respects iOS 26.5 PWA safe-area insets.
 */
import { Wrench, Clock } from 'lucide-react';

interface Props {
  name: string;
  message?: string;
  until?: string | null;
}

const MaintenancePage = ({ name, message, until }: Props) => (
  <div
    className="min-h-screen flex items-center justify-center bg-background px-6"
    dir="rtl"
    style={{
      paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)',
      paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
    }}
  >
    <div className="max-w-sm w-full text-center">
      <div className="w-16 h-16 rounded-full bg-secondary/40 flex items-center justify-center mx-auto mb-5">
        <Wrench className="w-5 h-5 text-muted-foreground" strokeWidth={1.3} />
      </div>
      <p className="text-[10px] text-muted-foreground/50 font-light tracking-[0.35em] mb-2">
        صيانة
      </p>
      <h1 className="text-[16px] text-foreground font-light mb-3">{name}</h1>
      <p className="text-[12px] text-muted-foreground/80 font-light leading-relaxed whitespace-pre-line">
        {message || 'جارٍ العمل عليه.\nترقّبوا الإطلاق قريباً بإذن الله.'}
      </p>
      {until && (
        <div className="mt-5 inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-secondary/40 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          <span>متوقع: {until}</span>
        </div>
      )}
    </div>
  </div>
);

export default MaintenancePage;
