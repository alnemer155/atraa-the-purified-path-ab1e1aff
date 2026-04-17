import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const PrivacyPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
      updated={isAr ? 'آخر تحديث: 2026-04-17' : 'Last updated: 2026-04-17'}
    >
      {isAr ? (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. مقدمة</h2>
            <p>تطبيق "عِتَرَةً" يحترم خصوصيتك. لا نطلب تسجيل حساب ولا نجمع معلومات شخصية تعريفية. هذه السياسة توضح ماذا يتم وماذا لا يتم تخزينه.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. البيانات المخزّنة محلياً</h2>
            <p>يحفظ التطبيق على جهازك فقط: المدينة المختارة، تعديل التاريخ الهجري، حالة التسبيح وآخر قراءة، اللغة المفضلة، تفعيل تنبيه الأذان. لا تُرسل هذه البيانات إلى أي خادم.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. الخدمات الخارجية</h2>
            <p>نستعلم عن أوقات الصلاة من Aladhan API وعن الطقس من wttr.in باستخدام إحداثيات المدينة فقط (دون أي معرّف شخصي).</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الإذن بالموقع والإشعارات</h2>
            <p>الإذن بالموقع يُستخدم محلياً لتحديد المدينة الأقرب وحساب القبلة. الإشعارات المحلية تُجدول داخل المتصفح ولا تمر بأي خادم.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. الأطفال</h2>
            <p>التطبيق مناسب لجميع الأعمار ولا يجمع أي بيانات عن الأطفال.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. التواصل</h2>
            <p>للاستفسارات: privacy@atraa.xyz</p>
          </section>
        </>
      ) : (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Introduction</h2>
            <p>Atraa respects your privacy. We do not require account registration and do not collect personally identifiable information. This policy describes what is and is not stored.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Locally Stored Data</h2>
            <p>The app stores on your device only: selected city, Hijri date offset, tasbih state and last reading, preferred language, prayer-time notification toggle. None of this data is sent to any server.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Third-Party Services</h2>
            <p>We query Aladhan API for prayer times and wttr.in for weather using only the city coordinates (without any personal identifier).</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Location & Notifications</h2>
            <p>Location permission is used locally to determine the nearest city and Qibla direction. Local notifications are scheduled in your browser and never pass through any server.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Children</h2>
            <p>The app is suitable for all ages and does not collect any data on children.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Contact</h2>
            <p>For inquiries: privacy@atraa.xyz</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default PrivacyPage;
