import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Disclaimer — Atraa.
 * Rewritten for v2.9.20 to cover the full Atraa service network
 * (Khatma, Athar, Qasaid, Audio), AI features (title/name verification,
 * Atraa AI personas), and the Sepia-locked theme system.
 */
const DisclaimerPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'إخلاء المسؤولية' : 'Disclaimer'}
      updated={isAr ? 'آخر تحديث: 2026-05-13 — v2.9.20' : 'Last updated: 2026-05-13 — v2.9.20'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              يرجى قراءة هذا الإخلاء بعناية قبل استخدام أيّ من خدمات <span className="font-semibold">منصة عترة الدينية</span>: التطبيق الأصلي،
              <span className="font-semibold"> atraa.xyz</span>،
              <span className="font-semibold"> khatma.atraa.xyz</span>،
              <span className="font-semibold"> athar.atraa.xyz</span>،
              <span className="font-semibold"> qasaid.atraa.xyz</span>،
              <span className="font-semibold"> audio.atraa.xyz</span>،
              <span className="font-semibold"> demo.atraa.xyz</span>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. طبيعة المحتوى الديني</h2>
            <p className="mb-2">يُقدَّم المحتوى (أدعية، زيارات، أذكار، أوقات صلاة، اتجاه القبلة، التاريخ الهجري، نصوص قرآنية، أقوال «أثر»، قصائد حسينية) لأغراض <span className="font-semibold">تعليمية وتذكيرية وتعبدية شخصية</span> فقط.</p>
            <p>المحتوى ليس فتوى شرعية مُلزِمة، ولا بديلاً عن الرجوع إلى مكتب مرجع التقليد في المسائل التكليفية، ولا إجماعاً علمياً في المسائل الخلافية.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. أوقات الصلاة (الجعفرية)</h2>
            <p className="mb-2">تُحسب عبر <span className="font-semibold">معهد الجيوفيزياء بجامعة طهران</span> (طريقة Ja'fari) من خلال AlAdhan API. هذه حسابات فلكية تقريبية وقد تختلف بدقيقة أو دقيقتين عن التقاويم المحلية بسبب اختلاف معاملات الأفق ودقة الإحداثيات والتوقيت المحلي.</p>
            <p>للاحتياط، راجع المواقيت الرسمية المحلية في بلدك.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. اتجاه القبلة والبوصلة</h2>
            <p>يُحسب باستخدام معادلة الدائرة العظمى من إحداثياتك إلى إحداثيات الكعبة (21.422487, 39.826206). الدقة تعتمد على مقياس المغناطيسية في جهازك (قد يحتاج لمعايرة بحركة على شكل ٨)، والتداخل المغناطيسي المحيط، وإذن مستشعرات الحركة. للتحقّق القاطع استخدم بوصلة فيزيائية معايرة أو راجع المساجد المحلية.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. النصوص القرآنية</h2>
            <p>تُعرض الآيات بالرسم العثماني المصدر من <span className="font-semibold">مجمع الملك فهد لطباعة المصحف الشريف</span> عبر AlQuran.cloud. أيّ اختلاف إملائي عن النسخ المطبوعة المعتادة في بعض المصاحف هو طبيعي ومعتمد. أبلغ عن أيّ خطأ مطبعي إلى: <span className="font-semibold">support@atraa.xyz</span>.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. التاريخ الهجري</h2>
            <p>يُعرض التاريخ الهجري بناءً على حسابات فلكية، وقد يختلف بيوم عن إعلانات الهلال الرسمية. يتوفّر خيار <span className="font-semibold">تعديل اليوم (±2)</span> في الإعدادات.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. الختمات (khatma.atraa.xyz)</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>الختمات الجماعية أداة تنظيمية تذكيرية فقط؛ نيّتك وقصدك هما المعتبران شرعاً.</li>
              <li>أسماء القرّاء والإهداءات تخضع لفحص AI لرفض الإساءات وانتحال أسماء المعصومين.</li>
              <li>قد يقع خطأ بشري أو تقنّي في عدد القراءات؛ تواصل معنا لتصحيحه.</li>
              <li>خيار «دائماً» للختمات مقفول حالياً وسيُفعَّل لاحقاً.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. أثر (athar.atraa.xyz)</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>المقولات منتقاة من المصادر التراثية المعتمدة (نهج البلاغة، تحف العقول، الكافي، صحيح البخاري، صحيح مسلم، سنن الترمذي، وغيرها).</li>
              <li>تُعرض جميع المقولات لكلّ المستخدمين دون فلتر مذهبي.</li>
              <li>قد يطرأ تعديل على الصياغة لتقصيرها لأغراض المشاركة؛ راجع المصدر الأصلي للحكم الفقهي أو الاستشهاد العلمي.</li>
              <li>صورة المشاركة تتضمّن شعار «أثر» شفّاف؛ نشرها ومشاركتها مسموحة لأغراض الإفادة فقط.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. القصائد الحسينية والبودكاست (qasaid.atraa.xyz)</h2>
            <p>القصائد محتوى ديني عاطفي مرتبط بأهل البيت (ع)؛ ليست موسيقى. ميزات التشغيل (التكرار، التقديم/الإرجاع، النشر، الفيديو) أدوات تيسير فقط. حقوق التلاوات تعود لأصحابها وقُيِّدت بإذن العرض.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. الأدعية والزيارات والأذكار</h2>
            <p>أيّ نص يبدأ بـ «(» أو «[» أو «{'{'}» يُعرض بلون رصاصي شفاف للإشارة إلى أنّه <span className="font-semibold">شرحٌ أو توضيح</span> وليس جزءاً أصيلاً من الدعاء — ما عدا «صلوات» و«عليه السلام» و«عليها السلام» التي تظلّ بلونها الطبيعي. ميزة «الكلمة المُلوَّنة بالنقر المزدوج» للقراءة الشخصية فقط، تُحفظ مؤقّتاً ولا تُرسَل لأيّ خادم.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. خدمات الطرف الثالث</h2>
            <p>يستعلم التطبيق عن AlAdhan (المواقيت)، AlQuran.cloud (القرآن)، wttr.in (الطقس)، Nominatim/OpenStreetMap (الجغرافيا)، Atraa Cloud (الختمات/أثر/القصائد)، Atraa AI (التحقّق من العنوان والاسم). نحن غير مسؤولين عن انقطاعها أو دقّة بياناتها لحظة الاستعلام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. المحتوى السنّي</h2>
            <p>عند اختيار المذهب <span className="font-semibold">السنّي</span>، يعرض التطبيق مجموعة مختصرة من الأذكار والأدعية من المصادر المعتمدة لدى أهل السنّة (صحيح البخاري، صحيح مسلم، حصن المسلم، رياض الصالحين، الأذكار النووية، سنن الترمذي وأبي داود). هي مكتبة بدئية يجري توسيعها بعد المراجعة، وليست بديلاً عن الرجوع إلى أهل العلم في بلدك.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. عدم الضمان</h2>
            <p>تُقدَّم جميع خدمات عترة <span className="font-semibold">"كما هي" (As-Is)</span> دون أيّ ضمانات صريحة أو ضمنية. نُخلي مسؤوليتنا عن أيّ ضرر مباشر أو غير مباشر ناتج عن الاستخدام أو الاعتماد على المعلومات.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">13. التواصل والإبلاغ</h2>
            <p>للاستفسارات أو الإبلاغ عن أخطاء: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              Please read carefully before using any Atraa service: the native app, atraa.xyz, khatma.atraa.xyz, athar.atraa.xyz, qasaid.atraa.xyz, audio.atraa.xyz, demo.atraa.xyz.
            </p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Nature of Religious Content</h2>
            <p>All religious content is provided for educational, reminder, and personal devotional purposes only — not as a binding fatwa or substitute for consulting your marja' on obligatory matters.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Prayer Times</h2>
            <p>Calculated via the Tehran Geophysics Institute (Ja'fari) method through AlAdhan API. Approximate astronomical computation; verify locally in cases of caution.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Qibla</h2>
            <p>Great-Circle bearing to the Kaaba (21.422487, 39.826206). Accuracy depends on your magnetometer; calibrate or use a physical compass for verification.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Quranic Text</h2>
            <p>Uthmani script from the King Fahd Glorious Quran Printing Complex via AlQuran.cloud. Report typos to support@atraa.xyz.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Khatmas, Athar, Qasaid</h2>
            <p>User submissions are AI-filtered for offensiveness and impersonation. The Athar library is for personal sharing; verify with original sources for scholarly use. Qasaid are religious recitations, not music.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Third-Party Services</h2>
            <p>AlAdhan, AlQuran.cloud, wttr.in, Nominatim, Atraa Cloud, Atraa AI. We are not responsible for outages or data accuracy.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. No Warranty</h2>
            <p>All Atraa services are provided "As-Is" without warranties of any kind.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Contact</h2>
            <p>support@atraa.xyz</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default DisclaimerPage;
