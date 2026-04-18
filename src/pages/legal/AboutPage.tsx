import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const AboutPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'عن التطبيق' : 'About'}
      updated={isAr ? 'الإصدار v11 · بناء 450' : 'Version v11 · build 450'}
    >
      {isAr ? (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">عِتَرَةً</h2>
            <p>منصة إسلامية شيعية تقدّم محتوى دينياً منظماً وحديثاً: أوقات الصلاة، أدعية، زيارات، أذكار، تسبيح، واتجاه القبلة.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">رسالتنا</h2>
            <p>تيسير الوصول إلى المحتوى الديني للمسلمين في كل مكان بتجربة بسيطة وأنيقة وخصوصية تامة.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">المصادر</h2>
            <p>أوقات الصلاة: Aladhan API. الطقس: wttr.in. النصوص الدينية مأخوذة من المراجع التراثية المعتمدة.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">التواصل</h2>
            <p>info@atraa.xyz</p>
          </section>
        </>
      ) : (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Atraa</h2>
            <p>An Islamic Shia platform offering organized, modern religious content: prayer times, duas, ziyarat, adhkar, tasbih, and Qibla direction.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Our Mission</h2>
            <p>To make religious content easily accessible to Muslims everywhere with a simple, elegant experience and complete privacy.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Sources</h2>
            <p>Prayer times: Aladhan API. Weather: wttr.in. Religious texts are sourced from established heritage references.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Contact</h2>
            <p>info@atraa.xyz</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default AboutPage;
