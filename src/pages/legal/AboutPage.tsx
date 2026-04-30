import { useTranslation } from 'react-i18next';
import { ExternalLink, MessageCircle } from 'lucide-react';
import LegalLayout from '@/components/legal/LegalLayout';

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbCNwblJZg466AM5CC2R';

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
          <section className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-center">
            <p className="text-[8px] text-gold/80 font-light tracking-[0.3em] mb-2">قال رسول الله ﷺ</p>
            <p className="quran-uthmani text-[17px] text-foreground leading-loose">
              إنِّي تَارِكٌ فِيكُمُ الثَّقَلَيْنِ كِتَابَ اللهِ وَعِتْرَتِي أَهْلَ بَيْتِي
            </p>
            <p className="text-[10px] text-muted-foreground/70 font-light mt-3 leading-relaxed">
              اسم التطبيق <span className="text-foreground">«عِتْرَة»</span> مستوحى مباشرة من هذا الحديث الشريف.
            </p>
          </section>

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
            <p className="tabular-nums">v2.7.78 · بناء 195</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">قناة التطبيق على واتساب</h2>
            <p className="mb-2">تابع آخر التحديثات والإعلانات الرسمية عبر قناة <span className="font-semibold">قـــناة عِتْرَة</span> على واتساب:</p>
            <a
              href={WHATSAPP_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/15 transition-colors text-[13px]"
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>الاشتراك في القناة</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">المطوّر</h2>
            <p className="mb-2">تطوير وتصميم: <span className="text-foreground">Bin Jaafar</span></p>
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
          <section className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-center">
            <p className="text-[8px] text-gold/80 font-light tracking-[0.3em] mb-2">The Prophet ﷺ said</p>
            <p className="quran-uthmani text-[17px] text-foreground leading-loose" dir="rtl">
              إنِّي تَارِكٌ فِيكُمُ الثَّقَلَيْنِ كِتَابَ اللهِ وَعِتْرَتِي أَهْلَ بَيْتِي
            </p>
            <p className="text-[10px] text-muted-foreground/70 font-light mt-3 leading-relaxed">
              "I am leaving among you the Two Weighty Things — the Book of Allah and my <span className="text-foreground">Itrah</span> (family)." The app's name <span className="text-foreground">«Atraa / عِتْرَة»</span> is drawn directly from this noble hadith.
            </p>
          </section>

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
            <p className="tabular-nums">v2.7.78 · build 195</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">WhatsApp Channel</h2>
            <p className="mb-2">Follow the <span className="font-semibold">قـــناة عِتْرَة</span> channel on WhatsApp for official updates and announcements:</p>
            <a
              href={WHATSAPP_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/15 transition-colors text-[13px]"
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Join the channel</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Developer</h2>
            <p className="mb-2">Developed and designed by: <span className="text-foreground">Bin Jaafar</span></p>
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
