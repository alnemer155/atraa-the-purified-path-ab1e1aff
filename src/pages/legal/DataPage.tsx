import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const DataPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'جمع البيانات' : 'Data Collection'}
      updated={isAr ? 'آخر تحديث: 2026-04-17' : 'Last updated: 2026-04-17'}
    >
      {isAr ? (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">ما الذي نجمعه؟</h2>
            <p className="mb-2"><span className="font-semibold">شخصياً:</span> لا شيء. لا اسم، لا بريد، لا رقم هاتف، لا حساب.</p>
            <p className="mb-2"><span className="font-semibold">على جهازك (محلياً):</span> المدينة، إحداثياتها، تعديل الهجري، اللغة، حالة التسبيح وآخر قراءة، تفعيل التنبيه.</p>
            <p><span className="font-semibold">طلبات شبكة:</span> Aladhan (أوقات الصلاة) و wttr.in (الطقس) باستخدام إحداثيات المدينة فقط.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">لا تتبّع</h2>
            <p>لا نستخدم تتبّع إعلانياً ولا أدوات تحليل تعرّف عن المستخدم. لا توجد ملفات تعريف ارتباط من أطراف ثالثة لأغراض تسويقية.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">حذف البيانات</h2>
            <p>يمكنك حذف جميع البيانات المخزّنة محلياً عن طريق إعدادات المتصفح/النظام أو بإلغاء تثبيت التطبيق.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">إفصاح App Store</h2>
            <p>تصنيف بيانات التطبيق وفق Apple App Privacy: <span className="font-semibold">"Data Not Collected"</span>.</p>
          </section>
        </>
      ) : (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">What we collect</h2>
            <p className="mb-2"><span className="font-semibold">Personal:</span> Nothing. No name, email, phone, or account.</p>
            <p className="mb-2"><span className="font-semibold">On your device (locally):</span> city, its coordinates, Hijri offset, language, tasbih state and last reading, notification toggle.</p>
            <p><span className="font-semibold">Network requests:</span> Aladhan (prayer times) and wttr.in (weather) using only the city coordinates.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">No tracking</h2>
            <p>We do not use ad tracking or user-identifying analytics. No third-party cookies for marketing.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">Data Deletion</h2>
            <p>You can delete all locally stored data via your browser/system settings or by uninstalling the app.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">App Store Disclosure</h2>
            <p>App data classification per Apple App Privacy: <span className="font-semibold">"Data Not Collected"</span>.</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default DataPage;
