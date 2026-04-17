import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const DisclaimerPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'إخلاء المسؤولية' : 'Disclaimer'}
      updated={isAr ? 'آخر تحديث: 2026-04-17' : 'Last updated: 2026-04-17'}
    >
      {isAr ? (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. طبيعة المحتوى</h2>
            <p>المعلومات الدينية المقدّمة في التطبيق لأغراض تعليمية وتذكيرية. لا تُعدّ بديلاً عن الفتاوى الشرعية الصادرة عن المراجع المعتمدين.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. أوقات الصلاة والقبلة</h2>
            <p>أوقات الصلاة وحساب اتجاه القبلة مبنيان على حسابات فلكية تقريبية. للتأكد القاطع يُنصح بالرجوع إلى مكاتب المراجع المحلية.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. دقة البوصلة</h2>
            <p>دقة البوصلة تعتمد على معايرة جهازك. إذا لاحظت اختلافاً يرجى معايرة الهاتف بحركة الرقم 8.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. عدم الضمان</h2>
            <p>التطبيق يُقدَّم "كما هو" دون أي ضمانات. لا نتحمل مسؤولية أي خطأ في المعلومات أو انقطاع في الخدمة.</p>
          </section>
        </>
      ) : (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Nature of Content</h2>
            <p>The religious information in this app is for educational and reminder purposes only and is not a substitute for fatwas issued by qualified religious authorities.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Prayer Times & Qibla</h2>
            <p>Prayer times and Qibla direction are based on approximate astronomical calculations. For absolute certainty, please consult local religious authorities.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Compass Accuracy</h2>
            <p>Compass accuracy depends on your device calibration. If you notice deviation, calibrate the device with a figure-8 motion.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. No Warranty</h2>
            <p>The app is provided "as is" without warranty of any kind. We are not liable for any errors in information or service interruption.</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default DisclaimerPage;
