import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import LegalLayout from '@/components/legal/LegalLayout';

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'عن التطبيق' : 'About'}
      updated={`${t('app.name')} · ${t('app.version')}`}
    >
      {isAr ? (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">عِتَرَةً</h2>
            <p>منصة إسلامية شيعية تقدّم محتوى دينياً منظماً وحديثاً: أوقات الصلاة، أدعية، زيارات، أذكار، تسبيح، القرآن الكريم، واتجاه القبلة.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">رسالتنا</h2>
            <p>تيسير الوصول إلى المحتوى الديني للمسلمين في كل مكان بتجربة بسيطة وأنيقة وخصوصية تامة.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">المصادر</h2>
            <p>أوقات الصلاة: Aladhan API. القرآن الكريم: مجمع الملك فهد لطباعة المصحف الشريف عبر AlQuran.cloud. الطقس: wttr.in. النصوص الدينية مأخوذة من المراجع التراثية المعتمدة (حقيبة المؤمن وغيرها).</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">الإصدار</h2>
            <p className="tabular-nums">v2.6.88 · بناء 120</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">المطوّر</h2>
            <p className="mb-2">تطوير وتصميم: <span className="text-foreground">Abdullah Bin Jaafar | Developed</span></p>
            <a
              href="https://abj-dev.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline text-[13px]"
            >
              abj-dev.xyz
              <ExternalLink className="w-3 h-3" />
            </a>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">التواصل</h2>
            <p>support@atraa.xyz</p>
          </section>
        </>
      ) : (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Atraa</h2>
            <p>An Islamic Shia platform offering organized, modern religious content: prayer times, duas, ziyarat, adhkar, tasbih, the Holy Quran, and Qibla direction.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Our Mission</h2>
            <p>To make religious content easily accessible to Muslims everywhere with a simple, elegant experience and complete privacy.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Sources</h2>
            <p>Prayer times: Aladhan API. Quran: King Fahd Glorious Quran Printing Complex via AlQuran.cloud. Weather: wttr.in. Religious texts are sourced from established heritage references.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Version</h2>
            <p className="tabular-nums">v2.6.88 · build 120</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Developer</h2>
            <p className="mb-2">Developed and designed by: <span className="text-foreground">ABJ Dev</span></p>
            <a
              href="https://abj-dev.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline text-[13px]"
            >
              abj-dev.xyz
              <ExternalLink className="w-3 h-3" />
            </a>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Contact</h2>
            <p>support@atraa.xyz</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default AboutPage;
