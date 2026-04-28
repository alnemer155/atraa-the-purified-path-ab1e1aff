import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const DisclaimerPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'إخلاء المسؤولية' : 'Disclaimer'}
      updated={isAr ? 'آخر تحديث: 2026-04-28' : 'Last updated: 2026-04-28'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed mb-1">
              يرجى قراءة هذا الإخلاء بعناية قبل استخدام تطبيق "عِتَرَةً". باستخدامك للتطبيق فإنك تُقرّ بأنك اطّلعت على البنود التالية وتوافق عليها.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. طبيعة المحتوى الديني</h2>
            <p className="mb-2">يُقدّم تطبيق "عِتَرَةً" محتوى دينياً (أدعية، زيارات، أذكار، أوقات صلاة، اتجاه القبلة، التاريخ الهجري، نصوص قرآنية) لأغراض <span className="font-semibold">تعليمية وتذكيرية وتعبدية شخصية</span> فقط.</p>
            <p className="mb-2">لا يُعدّ المحتوى المعروض في التطبيق:</p>
            <ul className="list-disc ps-5 space-y-1 mb-2 text-foreground/85">
              <li>فتوى شرعية مُلزِمة.</li>
              <li>بديلاً عن الرجوع إلى المراجع الفقهية المعتمَدة في المسائل التكليفية.</li>
              <li>إجماعاً علمياً في المسائل الخلافية.</li>
            </ul>
            <p>يُنصح المستخدم دائماً بالعودة إلى مكتب مرجع التقليد الذي يقلّده في الأمور التي تحتاج حكماً شرعياً قاطعاً.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. أوقات الصلاة (الحساب الجعفري)</h2>
            <p className="mb-2">تُحسب أوقات الصلاة باستخدام طريقة <span className="font-semibold">معهد الجيوفيزياء بجامعة طهران (Ja'fari)</span> عبر واجهة AlAdhan API، وتعتمد على إحداثيات المدينة المختارة.</p>
            <p className="mb-2">هذه الحسابات <span className="font-semibold">فلكية تقريبية</span> وقد تختلف بفارق دقيقة أو دقيقتين عن التقاويم المحلية الرسمية بسبب:</p>
            <ul className="list-disc ps-5 space-y-1 mb-2 text-foreground/85">
              <li>اختلاف معاملات الأفق المعتمَدة محلياً.</li>
              <li>دقة الإحداثيات الجغرافية المخزّنة.</li>
              <li>التوقيت المحلي وفروقات الصيف/الشتاء.</li>
            </ul>
            <p>لا يتحمّل التطبيق مسؤولية أي خطأ ينتج عن الاعتماد المطلق على هذه المواقيت دون مراجعة المصادر المحلية المعتمدة في حالات الاحتياط.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. اتجاه القبلة والبوصلة</h2>
            <p className="mb-2">يُحسب اتجاه القبلة باستخدام معادلة الدائرة العظمى (Great Circle Bearing) من إحداثيات موقعك إلى إحداثيات الكعبة المشرّفة (21.422487, 39.826206).</p>
            <p className="mb-2">دقة البوصلة تعتمد كلياً على:</p>
            <ul className="list-disc ps-5 space-y-1 mb-2 text-foreground/85">
              <li><span className="font-semibold">مقياس المغناطيسية</span> في جهازك (قد يحتاج لمعايرة بحركة على شكل ٨).</li>
              <li>التداخل المغناطيسي من المعادن أو الأجهزة الإلكترونية المحيطة.</li>
              <li>إذن الوصول إلى مستشعرات الحركة (يُطلب من المستخدم).</li>
            </ul>
            <p>للتحقق القاطع من الاتجاه، يُنصح باستخدام بوصلة فيزيائية مُعايرة أو الرجوع إلى مساجد المنطقة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. النصوص القرآنية</h2>
            <p className="mb-2">تُعرض الآيات بالرسم العثماني المصدر من <span className="font-semibold">مجمع الملك فهد لطباعة المصحف الشريف</span> عبر AlQuran.cloud. أي اختلاف إملائي عن النسخ المطبوعة المعتادة في بعض المصاحف هو طبيعي ومعتمد.</p>
            <p>إذا لاحظت أي خطأ مطبعي أو إملائي، يُرجى الإبلاغ فوراً إلى: <span className="font-semibold tabular-nums">support@atraa.xyz</span></p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. التاريخ الهجري</h2>
            <p>يُعرض التاريخ الهجري بناءً على حسابات فلكية. قد يختلف بيوم واحد عن الإعلانات الرسمية للهلال في بلدك. تم توفير خيار <span className="font-semibold">تعديل اليوم (±2)</span> في الإعدادات لمواءمة التقويم المحلي.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. خدمات الطرف الثالث</h2>
            <p>يستعلم التطبيق عن البيانات من خدمات خارجية: AlAdhan (المواقيت)، AlQuran.cloud (القرآن)، wttr.in (الطقس)، Nominatim/OpenStreetMap (الجغرافيا العكسية). نحن غير مسؤولين عن انقطاع هذه الخدمات أو دقة بياناتها لحظة الاستعلام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. عدم الضمان</h2>
            <p>يُقدَّم التطبيق <span className="font-semibold">"كما هو" (As-Is)</span> دون أي ضمانات صريحة أو ضمنية تتعلق بدقة المحتوى أو ملاءمته لغرض معيّن أو استمرارية الخدمة. نُخلي مسؤوليتنا عن أي ضرر مباشر أو غير مباشر ناتج عن استخدام التطبيق أو الاعتماد على معلوماته.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. المحتوى السني (للمستخدمين السنّة)</h2>
            <p className="mb-2">عند اختيار المذهب <span className="font-semibold">السني</span>، يعرض التطبيق مجموعة مختصرة من الأذكار والأدعية المأخوذة من المصادر التالية المعتمدة لدى أهل السنة:</p>
            <ul className="list-disc ps-5 space-y-1 mb-2 text-foreground/85">
              <li>صحيح البخاري — الإمام محمد بن إسماعيل البخاري.</li>
              <li>صحيح مسلم — الإمام مسلم بن الحجاج النيسابوري.</li>
              <li>حصن المسلم من أذكار الكتاب والسنة — الشيخ سعيد بن علي بن وهف القحطاني.</li>
              <li>رياض الصالحين — الإمام يحيى بن شرف النووي.</li>
              <li>الأذكار النووية — الإمام النووي.</li>
              <li>سنن الترمذي وسنن أبي داود.</li>
            </ul>
            <p className="mb-2">المحتوى المعروض هو <span className="font-semibold">مجموعة مبدئية مختصرة</span> ويجري توسيعها تباعاً بعد التحقق والمراجعة. هو للقراءة والتذكير الشخصي فقط، ولا يُعدّ بديلاً عن الرجوع إلى أهل العلم المعتمدين في بلدك للأحكام والمسائل التكليفية.</p>
            <p>لتبديل المذهب لاحقاً يُطلب من المستخدم اجتياز ٣ أسئلة معرفة عامة بسيطة لتأكيد الاختيار، وهي أسئلة <span className="font-semibold">غير طائفية</span> ولا تتضمّن أي تفضيل مذهبي.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. التواصل والإبلاغ</h2>
            <p>للاستفسارات أو الإبلاغ عن أخطاء: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed mb-1">
              Please read this disclaimer carefully before using "Atraa". By using the app you acknowledge that you have read and agreed to the following terms.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Nature of Religious Content</h2>
            <p className="mb-2">Atraa provides religious content (supplications, ziyarat, adhkar, prayer times, Qibla direction, Hijri calendar, Quranic texts) strictly for <span className="font-semibold">educational, reminder, and personal devotional purposes</span>.</p>
            <p className="mb-2">The displayed content is <span className="font-semibold">not</span>:</p>
            <ul className="list-disc ps-5 space-y-1 mb-2 text-foreground/85">
              <li>A binding religious fatwa.</li>
              <li>A substitute for consulting recognised jurisprudential authorities on religious obligations.</li>
              <li>A scholarly consensus on disputed matters.</li>
            </ul>
            <p>Users are always advised to consult the office of their marja' (religious authority) for matters requiring a definitive ruling.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Prayer Times (Ja'fari Calculation)</h2>
            <p className="mb-2">Prayer times are calculated using the <span className="font-semibold">Institute of Geophysics, University of Tehran (Ja'fari)</span> method via the AlAdhan API, based on the coordinates of the selected city.</p>
            <p className="mb-2">These calculations are <span className="font-semibold">approximate astronomical computations</span> and may differ by 1–2 minutes from official local timetables due to:</p>
            <ul className="list-disc ps-5 space-y-1 mb-2 text-foreground/85">
              <li>Local horizon adjustments.</li>
              <li>Precision of stored geographical coordinates.</li>
              <li>Local time zone and DST variations.</li>
            </ul>
            <p>The app accepts no liability for any error resulting from sole reliance on these times without consulting locally recognised sources in cases of caution.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Qibla Direction & Compass</h2>
            <p className="mb-2">Qibla direction is calculated using the Great Circle Bearing formula from your coordinates to the Holy Kaaba (21.422487, 39.826206).</p>
            <p className="mb-2">Compass accuracy depends entirely on:</p>
            <ul className="list-disc ps-5 space-y-1 mb-2 text-foreground/85">
              <li>The <span className="font-semibold">magnetometer</span> in your device (may need figure-8 calibration).</li>
              <li>Magnetic interference from nearby metals or electronics.</li>
              <li>Motion-sensor permission granted by you.</li>
            </ul>
            <p>For absolute verification, please use a calibrated physical compass or consult local mosques.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Quranic Text</h2>
            <p className="mb-2">Verses are displayed in Uthmani script sourced from the <span className="font-semibold">King Fahd Glorious Quran Printing Complex</span> via AlQuran.cloud. Spelling differences from common print editions are normal and verified.</p>
            <p>If you notice any typographical or spelling error, please report immediately to: <span className="font-semibold tabular-nums">support@atraa.xyz</span></p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Hijri Date</h2>
            <p>The Hijri date is shown based on astronomical calculation. It may differ by one day from official moon-sighting announcements in your country. A <span className="font-semibold">day-offset adjustment (±2)</span> is provided in Settings for local calendar alignment.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Third-Party Services</h2>
            <p>The app queries external services: AlAdhan (timings), AlQuran.cloud (Quran), wttr.in (weather), Nominatim/OpenStreetMap (reverse geocoding). We are not responsible for outages or data accuracy at the moment of query.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. No Warranty</h2>
            <p>The app is provided <span className="font-semibold">"As-Is"</span> without warranties of any kind, express or implied, regarding accuracy, fitness for a particular purpose, or service continuity. We disclaim liability for any direct or indirect damage from using the app or relying on its information.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Sunni Content (for Sunni users)</h2>
            <p className="mb-2">When the <span className="font-semibold">Sunni</span> school is selected, the app shows a curated starter set of supplications and adhkar drawn from the following mainstream Sunni sources:</p>
            <ul className="list-disc ps-5 space-y-1 mb-2 text-foreground/85">
              <li>Sahih al-Bukhari — Imam Muhammad ibn Isma'il al-Bukhari.</li>
              <li>Sahih Muslim — Imam Muslim ibn al-Hajjaj al-Naysaburi.</li>
              <li>Hisn al-Muslim — Sheikh Sa'id ibn 'Ali ibn Wahf al-Qahtani.</li>
              <li>Riyad as-Salihin — Imam Yahya ibn Sharaf al-Nawawi.</li>
              <li>Al-Adhkar al-Nawawiyyah — Imam al-Nawawi.</li>
              <li>Sunan al-Tirmidhi and Sunan Abi Dawud.</li>
            </ul>
            <p className="mb-2">This is a <span className="font-semibold">small starter library</span> that will be expanded over time after review. It is provided for personal reading and reminder only, and is not a substitute for consulting recognised scholars in your country on rulings and obligations.</p>
            <p>To switch schools later the user must pass 3 easy <span className="font-semibold">non-sectarian</span> general-knowledge questions to confirm the change. The questions never favour any school.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. Contact & Reporting</h2>
            <p>Inquiries or error reports: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default DisclaimerPage;
