import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const DataPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'جمع البيانات' : 'Data Collection'}
      updated={isAr ? 'آخر تحديث: 2026-04-21' : 'Last updated: 2026-04-21'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              توضّح هذه الصفحة بشكل تفصيلي ومُصنَّف ما الذي يتم جمعه أو معالجته من بيانات أثناء استخدام تطبيق "عِتَرَةً"، تماشياً مع متطلبات إفصاح App Store Privacy Nutrition Labels و Google Play Data Safety و GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. الإفصاح المختصر</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">بيانات شخصية تعريفية:</span> لا شيء.</li>
              <li><span className="font-semibold">بيانات يتم جمعها وربطها بالمستخدم:</span> لا شيء.</li>
              <li><span className="font-semibold">بيانات يتم جمعها دون ربطها بالمستخدم:</span> لا شيء (لا تحليلات).</li>
              <li><span className="font-semibold">بيانات يتم تخزينها محلياً فقط:</span> تفضيلات الاستخدام.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. ما لا يتم جمعه (مؤكد)</h2>
            <p className="mb-2">التطبيق <span className="font-semibold">لا يجمع</span> أيٍّ مما يلي:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>الاسم، البريد الإلكتروني، رقم الهاتف، أو أي معرّف شخصي.</li>
              <li>صورة الملف الشخصي أو أي بيانات بيومترية.</li>
              <li>قائمة جهات الاتصال أو الصور أو الملفات.</li>
              <li>سجلّ التصفح أو نشاط التطبيق التفصيلي.</li>
              <li>معرّفات الجهاز الإعلانية (IDFA / GAID).</li>
              <li>عناوين IP من قِبَلنا (قد تسجّلها خدمات الطرف الثالث وفق سياساتها).</li>
              <li>أي بيانات مالية أو معلومات بطاقات.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. ما يُخزَّن محلياً (على جهازك فقط)</h2>
            <p className="mb-2">يستخدم التطبيق localStorage في المتصفح أو ذاكرة التطبيق على iOS/Android لحفظ:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>اسم وإحداثيات المدينة المختارة.</li>
              <li>تعديل التاريخ الهجري (-2 إلى +2).</li>
              <li>اللغة المفضّلة (ar / en).</li>
              <li>حالة عدّاد التسبيح وآخر تسبيحة.</li>
              <li>آخر دعاء/زيارة/ذكر تمّت قراءته.</li>
              <li>آخر سورة وآية في القرآن.</li>
              <li>تفعيل إشعارات الأذان (true/false).</li>
              <li>كاش "آية اليوم" ليوم واحد.</li>
            </ul>
            <p className="mt-2 text-muted-foreground/70 text-[11px]">هذه البيانات لا تخرج من جهازك أبداً.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الطلبات الخارجية</h2>
            <p className="mb-2">يقوم التطبيق بإرسال طلبات HTTPS لخدمات خارجية محدودة، تحتوي فقط على إحداثيات المدينة (دون أي معرّف):</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>AlAdhan API — أوقات الصلاة (طريقة جعفرية).</li>
              <li>AlQuran.cloud — قائمة السور وآياتها.</li>
              <li>wttr.in — الطقس.</li>
              <li>Nominatim/OpenStreetMap — الجغرافيا العكسية عند استخدام GPS.</li>
              <li>i.ibb.co — استضافة الشعارات والأيقونات.</li>
            </ul>
            <p className="mt-2">هذه الخدمات مستقلة عنّا ولها سياسات خصوصية خاصة بها.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. لا تتبّع، لا تحليلات</h2>
            <p>لا نستخدم Google Analytics ولا Facebook Pixel ولا أي أداة تتبّع إعلاني أو تحليلي يمكن أن تعرّف عن المستخدم. لا توجد ملفات تعريف ارتباط من أطراف ثالثة لأغراض تسويقية.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. حذف البيانات</h2>
            <p>يمكنك حذف جميع البيانات المخزّنة محلياً في أي وقت من خلال:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85 mt-1">
              <li>مسح بيانات الموقع/التطبيق من إعدادات الجهاز.</li>
              <li>إلغاء تثبيت التطبيق.</li>
              <li>استخدام وضع التصفح الخاص.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. إفصاح App Store</h2>
            <p>تصنيف Apple App Privacy: <span className="font-semibold">"Data Not Collected"</span>.</p>
            <p className="mt-1">تصنيف Google Play Data Safety: <span className="font-semibold">"No data collected"</span>.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. التواصل</h2>
            <p>للاستفسار: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              This page details, in a categorised format, what data is collected or processed during use of "Atraa", in line with App Store Privacy Nutrition Labels, Google Play Data Safety, and GDPR disclosure requirements.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Disclosure Summary</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Personally identifiable info:</span> none.</li>
              <li><span className="font-semibold">Data collected and linked to user:</span> none.</li>
              <li><span className="font-semibold">Data collected without linking to user:</span> none (no analytics).</li>
              <li><span className="font-semibold">Data stored locally only:</span> usage preferences.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. What Is Not Collected (Confirmed)</h2>
            <p className="mb-2">The app <span className="font-semibold">does not collect</span> any of the following:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Name, email, phone number, or any personal identifier.</li>
              <li>Profile photo or biometric data.</li>
              <li>Contacts, photos, or files.</li>
              <li>Browsing history or detailed app activity.</li>
              <li>Device advertising IDs (IDFA / GAID).</li>
              <li>IP addresses by us (third-party services may log per their own policies).</li>
              <li>Any financial data or card information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. What Is Stored Locally (on your device only)</h2>
            <p className="mb-2">The app uses browser localStorage or in-app storage on iOS/Android to save:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Selected city name and coordinates.</li>
              <li>Hijri date offset (-2 to +2).</li>
              <li>Preferred language (ar / en).</li>
              <li>Tasbih counter state and last dhikr.</li>
              <li>Last dua/ziyara/dhikr read.</li>
              <li>Last surah and ayah read.</li>
              <li>Adhan notifications toggle (true/false).</li>
              <li>One-day cache of "verse of the day".</li>
            </ul>
            <p className="mt-2 text-muted-foreground/70 text-[11px]">This data never leaves your device.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. External Requests</h2>
            <p className="mb-2">The app sends HTTPS requests to a limited set of external services containing only city coordinates (no identifier):</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>AlAdhan API — prayer times (Ja'fari method).</li>
              <li>AlQuran.cloud — surahs and verses.</li>
              <li>wttr.in — weather.</li>
              <li>Nominatim/OpenStreetMap — reverse geocoding when GPS is used.</li>
              <li>i.ibb.co — hosting of logos and icons.</li>
            </ul>
            <p className="mt-2">These services are independent and have their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. No Tracking, No Analytics</h2>
            <p>We do not use Google Analytics, Facebook Pixel, or any user-identifying ad/analytics tool. No third-party marketing cookies are used.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Data Deletion</h2>
            <p>You can delete all locally stored data at any time via:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85 mt-1">
              <li>Clearing site/app data in device settings.</li>
              <li>Uninstalling the app.</li>
              <li>Using private browsing mode.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. App Store Disclosure</h2>
            <p>Apple App Privacy classification: <span className="font-semibold">"Data Not Collected"</span>.</p>
            <p className="mt-1">Google Play Data Safety: <span className="font-semibold">"No data collected"</span>.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Contact</h2>
            <p>Inquiries: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default DataPage;
