import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const PrivacyPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
      updated={isAr ? 'آخر تحديث: 2026-04-21' : 'Last updated: 2026-04-21'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed mb-1">
              تطبيق "عِتَرَةً" مُصمَّم على مبدأ <span className="font-semibold">الخصوصية أولاً (Privacy by Design)</span>. لا يوجد حساب مستخدم، ولا يتم جمع أي بيانات شخصية تعريفية. توضّح هذه السياسة بالتفصيل ما الذي يتم تخزينه أو معالجته، وأين، ولماذا.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. مقدمة وملخّص تنفيذي</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>لا حساب، لا تسجيل، لا بريد إلكتروني، لا رقم هاتف.</li>
              <li>لا تتبّع إعلاني، لا أدوات تحليل تعرّف عن المستخدم، لا ملفات تعريف ارتباط من أطراف ثالثة لأغراض تسويقية.</li>
              <li>كل التفضيلات تُحفظ <span className="font-semibold">محلياً على جهازك فقط</span> عبر localStorage في المتصفح أو ذاكرة التطبيق على iOS/Android.</li>
              <li>الطلبات الخارجية محصورة بخدمات دينية وجغرافية محدودة، وتُرسَل بإحداثيات المدينة فقط دون أي معرّف للمستخدم.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. البيانات المخزّنة محلياً (على جهازك)</h2>
            <p className="mb-2">يحفظ التطبيق على جهازك فقط:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">المدينة المختارة</span> واسمها وإحداثياتها (lat, lng).</li>
              <li><span className="font-semibold">تعديل التاريخ الهجري</span> (قيمة بين -2 و +2).</li>
              <li><span className="font-semibold">اللغة المفضّلة</span> (عربية / English).</li>
              <li><span className="font-semibold">حالة التسبيح</span> (العدّاد الحالي وآخر تسبيحة).</li>
              <li><span className="font-semibold">آخر قراءة</span> في الأدعية والزيارات والأذكار (لمتابعة القراءة).</li>
              <li><span className="font-semibold">آخر سورة وآية</span> في القرآن (لميزة "متابعة القراءة").</li>
              <li>تفعيل <span className="font-semibold">إشعارات الأذان</span> (نعم/لا فقط، بدون أي بيانات شخصية).</li>
              <li>كاش <span className="font-semibold">آية اليوم</span> ليوم واحد لتسريع الفتح.</li>
            </ul>
            <p className="mt-2">لا تُرسَل أيٌّ من هذه البيانات إلى أي خادم. تبقى محصورة بجهازك ويمكنك حذفها بالكامل عبر إعدادات المتصفح/النظام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. الخدمات الخارجية وكيفية استخدامها</h2>
            <p className="mb-2">عند تشغيل التطبيق، تُرسَل طلبات HTTPS إلى الخدمات التالية بإحداثيات المدينة فقط (دون أي معرّف):</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">AlAdhan API</span> (api.aladhan.com) — لحساب أوقات الصلاة بالطريقة الجعفرية.</li>
              <li><span className="font-semibold">AlQuran.cloud API</span> (api.alquran.cloud) — لتحميل قائمة السور وآياتها بالرسم العثماني.</li>
              <li><span className="font-semibold">wttr.in</span> — لاسترجاع طقس المدينة فقط.</li>
              <li><span className="font-semibold">Nominatim / OpenStreetMap</span> — للجغرافيا العكسية عند استخدام GPS لتحديد أقرب مدينة.</li>
              <li><span className="font-semibold">i.ibb.co</span> — لاستضافة الشعارات الموسمية والأيقونات.</li>
            </ul>
            <p className="mt-2">لا نمتلك سيطرة على سياسات هذه الخدمات. عناوين IP العامة قد تُسجَّل من قبلهم لأغراض تشغيلية بحتة وفقاً لسياساتهم الخاصة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الإذن بالموقع الجغرافي</h2>
            <p>عند الضغط على زر "موقعي" في اختيار المدينة، يُطلب منك السماح بالوصول إلى GPS. يُستخدم الموقع <span className="font-semibold">محلياً فقط</span> لتحديد أقرب مدينة من قائمتنا المُسبَقة وحساب اتجاه القبلة. لا تُرسَل إحداثياتك الفعلية إلى أي خادم — يُعاد تعيينها محلياً إلى إحداثيات المدينة المُختارة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. الإشعارات المحلية</h2>
            <p>إشعارات الأذان تُجدوَل عبر متصفحك أو نظام التشغيل (Web Notifications API / Capacitor LocalNotifications). لا تمر بأي خادم خارجي ولا تُرسَل لأي طرف ثالث.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. مستشعرات الجهاز (البوصلة)</h2>
            <p>عند فتح صفحة القبلة، يُطلب إذن الوصول إلى مستشعر الاتجاه (DeviceOrientation). تُعالج البيانات <span className="font-semibold">حصراً داخل المتصفح/التطبيق</span> ولا تُحفظ أو تُرسَل لأي طرف.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. ملفات تعريف الارتباط (Cookies)</h2>
            <p>لا نستخدم ملفات تعريف ارتباط لأغراض تسويقية أو تحليلية. التطبيق يستخدم localStorage فقط لحفظ التفضيلات محلياً.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. حذف البيانات</h2>
            <p>يمكنك حذف جميع البيانات المخزّنة محلياً في أي وقت عن طريق:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85 mt-1">
              <li>مسح بيانات الموقع من إعدادات المتصفح.</li>
              <li>إلغاء تثبيت التطبيق من iOS أو Android.</li>
              <li>استخدام وضع التصفح الخاص (Incognito).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. الأطفال</h2>
            <p>التطبيق مناسب لجميع الأعمار ولا يجمع أي بيانات عن المستخدمين بمن فيهم الأطفال دون 13 عاماً، تماشياً مع COPPA و GDPR-K.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. تصنيف Apple App Privacy</h2>
            <p>تصنيف بيانات التطبيق لدى متجر Apple: <span className="font-semibold">"Data Not Collected"</span> — لا توجد بيانات تُجمع أو تُربَط بهوية المستخدم.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. التغييرات على هذه السياسة</h2>
            <p>قد نقوم بتحديث هذه السياسة لتعكس تغييرات تقنية أو قانونية. يُعرَض تاريخ آخر تحديث في أعلى الصفحة. استمرارك في استخدام التطبيق بعد التحديث يُعدّ موافقة ضمنية.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. التواصل</h2>
            <p>للاستفسارات حول الخصوصية: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed mb-1">
              Atraa is built on a <span className="font-semibold">Privacy-by-Design</span> principle. There is no user account, and no personally identifiable information is collected. This policy explains in detail what is stored or processed, where, and why.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Executive Summary</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>No account, registration, email, or phone number.</li>
              <li>No ad tracking, no user-identifying analytics, no third-party marketing cookies.</li>
              <li>All preferences are stored <span className="font-semibold">locally on your device only</span> via browser localStorage or in-app storage on iOS/Android.</li>
              <li>External requests are limited to a few religious and geographic services and contain only the city coordinates — never a user identifier.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Locally Stored Data (on your device)</h2>
            <p className="mb-2">The app stores only the following locally:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Selected city</span>, its name, and coordinates (lat, lng).</li>
              <li><span className="font-semibold">Hijri date offset</span> (between -2 and +2).</li>
              <li><span className="font-semibold">Preferred language</span> (Arabic / English).</li>
              <li><span className="font-semibold">Tasbih state</span> (current counter and last dhikr).</li>
              <li><span className="font-semibold">Last reading</span> across duas, ziyarat, and adhkar (to resume).</li>
              <li><span className="font-semibold">Last surah and ayah</span> in the Quran (continue-reading feature).</li>
              <li><span className="font-semibold">Adhan notification toggle</span> (yes/no only — no personal data).</li>
              <li><span className="font-semibold">Verse-of-the-day</span> cache for one day to speed up loading.</li>
            </ul>
            <p className="mt-2">None of this data is sent to any server. It remains on your device and can be fully deleted via your browser/system settings.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. External Services</h2>
            <p className="mb-2">When running, the app sends HTTPS requests to the following services using only city coordinates (no identifier):</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">AlAdhan API</span> (api.aladhan.com) — Ja'fari prayer-time calculation.</li>
              <li><span className="font-semibold">AlQuran.cloud API</span> (api.alquran.cloud) — Surah list & Uthmani text.</li>
              <li><span className="font-semibold">wttr.in</span> — city weather only.</li>
              <li><span className="font-semibold">Nominatim / OpenStreetMap</span> — reverse geocoding when GPS is used.</li>
              <li><span className="font-semibold">i.ibb.co</span> — hosting of seasonal logos and icons.</li>
            </ul>
            <p className="mt-2">We do not control these services' policies. Public IP addresses may be logged by them for purely operational purposes per their own policies.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Location Permission</h2>
            <p>When you tap "My location" in the city picker, GPS access is requested. The location is used <span className="font-semibold">locally only</span> to find the nearest city in our preset list and compute the Qibla direction. Your actual coordinates are never sent to any server — they are immediately reduced locally to the chosen city's coordinates.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Local Notifications</h2>
            <p>Adhan notifications are scheduled via your browser or OS (Web Notifications API / Capacitor LocalNotifications). They never pass through any external server and are not shared with any third party.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Device Sensors (Compass)</h2>
            <p>On the Qibla page, DeviceOrientation sensor permission is requested. Sensor readings are processed <span className="font-semibold">strictly inside the browser/app</span> and are never stored or transmitted.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Cookies</h2>
            <p>We do not use cookies for marketing or analytics. The app uses localStorage only to store preferences locally.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Data Deletion</h2>
            <p>You can delete all locally stored data at any time by:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85 mt-1">
              <li>Clearing site data in your browser settings.</li>
              <li>Uninstalling the app from iOS or Android.</li>
              <li>Using private/incognito browsing mode.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. Children</h2>
            <p>The app is suitable for all ages and does not collect any data on users — including children under 13 — in line with COPPA and GDPR-K.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. Apple App Privacy Classification</h2>
            <p>App data classification on the Apple App Store: <span className="font-semibold">"Data Not Collected"</span> — no data is collected or linked to user identity.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. Changes to This Policy</h2>
            <p>We may update this policy to reflect technical or legal changes. The last-updated date is shown at the top of this page. Continued use of the app after changes constitutes implicit acceptance.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. Contact</h2>
            <p>Privacy inquiries: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default PrivacyPage;
