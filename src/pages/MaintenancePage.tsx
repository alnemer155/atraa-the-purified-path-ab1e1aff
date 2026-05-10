/**
 * Generic "under construction" page used for sub-domains that are
 * routed but not yet built (qasaid.atraa.xyz, audio.atraa.xyz).
 */
import { Wrench } from 'lucide-react';

const MaintenancePage = ({ name }: { name: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6" dir="rtl">
    <div className="max-w-sm text-center">
      <div className="w-14 h-14 rounded-full bg-secondary/40 flex items-center justify-center mx-auto mb-5">
        <Wrench className="w-5 h-5 text-muted-foreground" strokeWidth={1.4} />
      </div>
      <h1 className="text-[16px] text-foreground font-light mb-2">{name}</h1>
      <p className="text-[12px] text-muted-foreground/80 font-light leading-relaxed">
        جارٍ العمل عليه.
        <br />
        ترقّبوا الإطلاق قريباً بإذن الله.
      </p>
    </div>
  </div>
);

export default MaintenancePage;
