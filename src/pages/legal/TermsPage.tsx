import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const TermsPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'شروط الاستخدام' : 'Terms of Use'}
      updated={isAr ? 'آخر تحديث: 2026-04-17' : 'Last updated: 2026-04-17'}
    >
      {isAr ? (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. القبول</h2>
            <p>باستخدامك تطبيق "عِتَرَةً" فإنك توافق على هذه الشروط. إن لم توافق فيرجى عدم الاستخدام.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. الاستخدام المقبول</h2>
            <p>التطبيق يقدّم محتوى دينياً (أوقات صلاة، أدعية، تسبيح، قبلة). يُمنع استخدام التطبيق لأي غرض غير مشروع أو يخالف القوانين المحلية أو متطلبات App Store.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. الملكية الفكرية</h2>
            <p>جميع النصوص الدينية مأخوذة من مصادرها التراثية وهي ملكية عامة. تصميم التطبيق وكوده محميّان لمشروع عِتَرَةً.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. حدود الاستخدام</h2>
            <p>المستخدم وحده مسؤول عن صحّة المعلومات التي يستفيد منها، ويُنصح دائماً بالرجوع إلى المراجع الدينية المعتمدة في الأمور الفقهية.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. التعديلات</h2>
            <p>يحق لنا تحديث هذه الشروط في أي وقت. يستمر استخدامك للتطبيق دلالة على الموافقة على التحديثات.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. التواصل</h2>
            <p>info@atraa.xyz</p>
          </section>
        </>
      ) : (
        <>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Acceptance</h2>
            <p>By using the Atraa app, you agree to these Terms. If you do not agree, please do not use the app.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Acceptable Use</h2>
            <p>The app provides religious content (prayer times, duas, tasbih, qibla). You may not use the app for any unlawful purpose or in violation of local laws or App Store requirements.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Intellectual Property</h2>
            <p>All religious texts are sourced from heritage references and are public domain. The app's design and code belong to the Atraa project.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Use Limits</h2>
            <p>The user alone is responsible for the accuracy of information they rely on; always consult qualified religious references for jurisprudential matters.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Changes</h2>
            <p>We may update these Terms at any time. Continued use of the app indicates acceptance of the updates.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Contact</h2>
            <p>info@atraa.xyz</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default TermsPage;
