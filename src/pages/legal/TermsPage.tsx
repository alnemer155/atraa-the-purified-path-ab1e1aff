import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Terms of Use — Atraa.
 * Rewritten for v2.13.40 to cover Khatma, Athar, cloud sync,
 * the Atraa subdomain network (khatma / athar) and the
 * Sepia-locked theme system.
 */
const TermsPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'شروط الاستخدام' : 'Terms of Use'}
      updated={isAr ? 'آخر تحديث: 2026-07-20 — v2.13.40' : 'Last updated: 2026-07-20 — v2.13.40'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              تحكم هذه الشروط استخدامك لـ <span className="font-semibold">منصة عترة الدينية</span> (Atraa)
              والموقع الرئيسي <span className="font-semibold">atraa.xyz</span> وجميع المواقع الفرعية التابعة:
              <span className="font-semibold"> khatma.atraa.xyz</span>،
              <span className="font-semibold"> athar.atraa.xyz</span>،
              إضافةً إلى التطبيقات الأصلية على iOS و Android. وباستخدامك أيّاً منها فإنّك تُقرّ بقراءة هذه الشروط وقبولها.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. الطرفان والقبول</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>أنت تتعاقد مع <span className="font-semibold">Bin Jaafar</span> (المطوّر).</li>
              <li>الاستخدام المتواصل يُعدّ موافقة ضمنية على آخر إصدار من الشروط.</li>
              <li>يجب أن تكون قد بلغت السنّ القانونية في بلدك أو لديك إذن وليّ الأمر.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. وصف الخدمات</h2>
            <p className="mb-2">منصة عترة الدينية مجموعة خدمات إسلامية مجانية بالكامل تشمل:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">القرآن الكريم</span> بالرسم العثماني (KFGQPC) مع قُرّاء متعدّدين وتفسير.</li>
              <li>أوقات الصلاة (الجعفرية)، اتجاه القبلة، التاريخ الهجري، التسبيح الرقمي.</li>
              <li>مكتبة الأدعية والزيارات والأذكار وفق مذهب أهل البيت عليهم السلام.</li>
              <li><span className="font-semibold">الختمات</span> الجماعية على <span className="font-semibold">khatma.atraa.xyz</span>.</li>
              <li><span className="font-semibold">أثر</span> — مكتبة أقوال النبي ﷺ والأئمّة (ع) على <span className="font-semibold">athar.atraa.xyz</span>.</li>
            </ul>
            <p className="mt-2">جميع الخدمات <span className="font-semibold">مجانية</span> ولا تتطلّب اشتراكاً ولا تسجيل دخول للوصول إلى المحتوى الديني الأساسي.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. دقّة المواقيت واتجاه القبلة</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>تُحسب المواقيت بطريقة <span className="font-semibold">الجعفرية (جامعة طهران)</span> على إحداثيات المدينة التي تختارها.</li>
              <li>يُراعى فرق التوقيت والتوقيت الصيفي للمدينة تلقائياً، لا موقع جهازك.</li>
              <li>اتجاه القبلة يُقاس بمستشعرات الجهاز وقد يتأثّر بالتشويش المغناطيسي؛ أعِد المعايرة عند الحاجة.</li>
              <li>عند اختلاف النتيجة عن توقيت المسجد المحلي أو رأي مرجعك، فالمرجع مقدَّم.</li>
            </ul>
            <p className="mt-2">تبقى المواقيت والاتجاه أدوات مساعدة، ولا نتحمّل مسؤولية أيّ خطأ ناتج عن بيانات المزوّد أو مستشعرات الجهاز.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الأوضاع البصرية والثيمات</h2>
            <p>الوضع الافتراضي والإلزامي لجميع المواقع التابعة لعترة هو <span className="font-semibold">الوضع السيبيا</span>. باقي الأوضاع مقفلة مؤقّتاً وتظهر برسالة «مُقفل مؤقتاً» إلى حين الانتهاء من ضبط القراءة فيها.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. سوء الاستخدام</h2>
            <p className="mb-2">تتعهّد بألّا تستخدم أيّاً من خدمات عترة:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>لأي غرض غير مشروع أو يخالف القوانين المحلّية أو الدولية.</li>
              <li>لإلحاق ضرر بالخدمة أو محاولة اختراقها أو الوصول غير المُصرَّح به.</li>
              <li>لإضافة أسماء قراءة / إهداءات / تعليقات تتضمّن إساءةً أو تمييزاً أو محتوى مخالفاً للشريعة.</li>
              <li>لنسخ المحتوى المحميّ أو إعادة توزيعه تجارياً دون إذن مكتوب.</li>
              <li>لانتحال صفة أحد المعصومين عليهم السلام أو شخصيات دينية معروفة.</li>
              <li>بطريقة تتعارض مع قواعد Apple App Store أو Google Play.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. المحتوى الذي يُنشئه المستخدمون</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">الختمات</span>: العنوان والإهداء واسم القارئ يُمرّر على فحص AI تلقائي لرفض الإساءات وانتحال أسماء المعصومين.</li>
              <li>أنت وحدك مسؤول عن كل ما تنشره؛ الإدارة تحتفظ بحق الإزالة الفورية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. الملكية الفكرية</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">النصوص الدينية</span> (القرآن، الأدعية، الزيارات، الأذكار، أقوال «أثر»): تراث إسلامي وملكية عامة. مصدر القرآن: مجمع الملك فهد لطباعة المصحف الشريف عبر AlQuran.cloud.</li>
              <li><span className="font-semibold">تصميم المنصة، شعاراتها، الكود، أيقوناتها، علامتها التجارية «عترة» وشعار «أثر»</span>: محميّ بحقوق الملكية الفكرية لـ Bin Jaafar.</li>
              <li>يُمنح المستخدم ترخيصاً <span className="font-semibold">محدوداً وغير حصري وغير قابل للتحويل</span> للاستخدام الشخصي فقط.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. مستوى الخدمة</h2>
            <p>نسعى لإبقاء الخدمات متاحة، لكنّنا <span className="font-semibold">لا نضمن</span> الاستمرارية الكاملة، خصوصاً للمواقع الفرعية تحت التطوير، أو خدمات الطرف الثالث (AlAdhan، AlQuran.cloud، Nominatim، Atraa Cloud، Atraa AI).</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. حدود المسؤولية</h2>
            <p>المستخدم مسؤول وحده عن صحّة المعلومات الدينية التي يعتمد عليها، ودقّة أوقات الصلاة في حالات الاحتياط، ودقة اتجاه القبلة. إلى أقصى حدّ يسمح به القانون، نُخلي مسؤوليتنا عن أي ضرر مباشر أو غير مباشر أو عرضي ينتج عن استخدام الخدمات.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. الإيقاف والإنهاء</h2>
            <p>يحقّ لنا إيقاف الوصول لأيّ مستخدم في حالات المخالفة الجوهرية أو مخاطر الأمان، ويحقّ لنا سحب أيّ من الخدمات من المتاجر أو الويب في أي وقت ودون إشعار مسبق. ويحقّ لك التوقّف عن الاستخدام وحذف التطبيق في أي لحظة دون التزام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. تعديل الشروط</h2>
            <p>يحقّ لنا تحديث هذه الشروط في أيّ وقت. سيظهر تاريخ آخر تحديث ورقم الإصدار في أعلى الصفحة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. القانون الحاكم</h2>
            <p>تخضع هذه الشروط لقوانين <span className="font-semibold">المملكة العربية السعودية</span>. يُسعى لحلّ أيّ نزاع ودياً قبل اللجوء إلى القضاء.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">13. التواصل</h2>
            <p><span className="font-semibold">Bin Jaafar</span><br />البريد: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Parties & Acceptance</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>You are contracting with <span className="font-semibold">Bin Jaafar</span> ("the developer").</li>
              <li>Continued use means acceptance of the latest version of these Terms.</li>
              <li>You must be of legal age in your country or have parental consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Service Description</h2>
            <p>Atraa provides the Quran (Uthmani / KFGQPC) with multiple reciters, prayer times (Ja'fari), the Qibla compass, the Hijri calendar, a digital tasbih, a supplications / ziyarat / adhkar library following the school of Ahl al-Bayt (peace be upon them), a worldwide Shia mosques &amp; shrines directory, group Khatmas (khatma.atraa.xyz) and the Athar quotes library (athar.atraa.xyz). All services are <span className="font-semibold">free</span>; no account is required for the core religious content.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Accuracy of Times &amp; Direction</h2>
            <p>Prayer times are calculated with the Ja‘fari (University of Tehran) method for the city you select, including its UTC offset and daylight-saving rule. The Qibla uses your device sensors. Both are aids: where they differ from your local mosque or a scholarly ruling, the latter prevails.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Themes</h2>
            <p>The default and currently mandatory theme across all Atraa sites is <span className="font-semibold">Sepia</span>. Other themes are temporarily locked while reading-comfort tuning is finalised.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Misuse</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Unlawful use, hacking, unauthorised access.</li>
              <li>Adding offensive reader names, dedications, or comments.</li>
              <li>Impersonating any of the infallibles (a.s.) or recognised scholars.</li>
              <li>Commercial redistribution of protected content.</li>
              <li>Anything against Apple App Store or Google Play policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. User-Generated Content</h2>
            <p>Khatma titles, dedications, reader names, and qasida comments are filtered by AI for offensiveness and impersonation. We may remove any content at our sole discretion.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Intellectual Property</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Religious texts (Quran, supplications, ziyarat, adhkar, Athar sayings) are public domain.</li>
              <li>Atraa platform design, code, icons, brand "Atraa" and "Athar" logo are protected IP of Bin Jaafar.</li>
              <li>You receive a limited, non-exclusive, non-transferable licence for personal use only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Service Level</h2>
            <p>We strive for availability but do not guarantee uninterrupted service, especially for subdomains under active development, or for third-party services (AlAdhan, AlQuran.cloud, Nominatim, Atraa Cloud, Atraa AI).</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. Limitation of Liability</h2>
            <p>You are responsible for the religious accuracy of the content you act on, and for verifying prayer times and Qibla in cases of caution. To the fullest extent permitted by law, we disclaim liability for any direct or indirect damage from using the services.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. Suspension & Termination</h2>
            <p>We may suspend access for material breach or security risks, and may withdraw any service at any time without notice. You may stop using and delete the app at any moment without obligation.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. Changes & Governing Law</h2>
            <p>We may update these Terms at any time. Governed by the laws of <span className="font-semibold">Saudi Arabia</span>. Disputes are first resolved amicably.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. Contact</h2>
            <p><span className="font-semibold">Bin Jaafar</span> · <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default TermsPage;
