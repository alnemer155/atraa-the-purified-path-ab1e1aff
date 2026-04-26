import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Terms of Service — Paddle MoR-compliant.
 * Seller: Bin Jaafar (sole proprietor).
 * Last updated: 2026-04-25 (v2.7.21).
 */
const TermsPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'شروط الاستخدام' : 'Terms of Service'}
      updated={isAr ? 'آخر تحديث: 2026-04-25' : 'Last updated: 2026-04-25'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              تحكم هذه الشروط استخدامك لتطبيق <span className="font-semibold">عِتَرَةً</span> (Atraa) والموقع المرتبط به (atraa.xyz)، المُقدَّم من المطوّر الفردي <span className="font-semibold">Bin Jaafar</span>. باستخدامك التطبيق فإنك تُقرّ بقراءة هذه الشروط وفهمها وقبولها بالكامل. إن لم توافق على أي بند، فيُرجى التوقّف عن استخدام التطبيق فوراً.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. الطرفان والقبول</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>أنت تتعاقد مع <span className="font-semibold">Bin Jaafar</span> (يُشار إليه بـ "نحن" أو "المطوّر").</li>
              <li>باستخدامك المتواصل للخدمة فإنك توافق على هذه الشروط.</li>
              <li>إذا كنت تستخدم التطبيق نيابةً عن جهة، فأنت تُقرّ بأن لديك الصلاحية القانونية لإلزام تلك الجهة.</li>
              <li>يجب أن تكون قد بلغت السنّ القانونية في بلدك أو أن يكون لديك إذن وليّ الأمر.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. وصف الخدمة</h2>
            <p>عِتَرَةً تطبيق ديني يُقدّم: أوقات الصلاة (بالحساب الجعفري)، اتجاه القبلة، التاريخ الهجري، الأدعية، الزيارات، الأذكار، التسبيح الرقمي، وعرض القرآن الكريم بالرسم العثماني. التطبيق مجاني بالكامل ولا يتطلب اشتراكاً أو تسجيل حساب. تتوفّر صفحة <span className="font-semibold">"دعم عِتَرَةً"</span> لتلقّي مساهمات طوعية كتعبير عن التقدير، وليست مقابل خدمة إضافية.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. سوء الاستخدام</h2>
            <p className="mb-2">تتعهّد بألّا تستخدم التطبيق:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>لأي غرض غير مشروع أو يخالف القوانين المحلية أو الدولية.</li>
              <li>للاحتيال أو إرسال رسائل غير مرغوب فيها.</li>
              <li>لإلحاق ضرر بالخدمة أو محاولة اختراقها أو الوصول غير المُصرَّح به (malware, probing, scraping).</li>
              <li>لنسخ المحتوى المحميّ أو إعادة بيعه أو إعادة توزيعه تجارياً دون إذن مكتوب.</li>
              <li>لانتهاك حقوق ملكية فكرية لأي طرف.</li>
              <li>بطريقة تتعارض مع قواعد متجر Apple App Store أو Google Play Store.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الملكية الفكرية</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">النصوص الدينية</span> (آيات القرآن، الأدعية، الزيارات، الأذكار): مصدرها التراث الإسلامي وهي ملكية عامة. مصدر القرآن: مجمع الملك فهد لطباعة المصحف الشريف عبر AlQuran.cloud. مصدر الأدعية: حقيبة المؤمن.</li>
              <li><span className="font-semibold">تصميم التطبيق وكوده وأيقوناته وشعاراته الموسمية وعلامته التجارية</span>: محمي بحقوق الملكية الفكرية لـ Bin Jaafar. لا يجوز إعادة استخدامه دون إذن كتابي.</li>
              <li><span className="font-semibold">العلامات التجارية</span> المستخدمة من خدمات الطرف الثالث (AlAdhan، AlQuran.cloud، Paddle، Vercel، Lovable إلخ) ملكية لأصحابها.</li>
            </ul>
            <p className="mt-2">يُمنح المستخدم ترخيصاً <span className="font-semibold">محدوداً وغير حصري وغير قابل للتحويل</span> لاستخدام التطبيق للأغراض الشخصية فقط.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. مستوى الخدمة</h2>
            <p>نبذل قصارى جهدنا لإبقاء التطبيق متاحاً وموثوقاً، لكننا <span className="font-semibold">لا نضمن</span> أن تكون الخدمة متاحة دون انقطاع أو خالية من الأخطاء أو متوافقة مع كل جهاز أو نظام تشغيل.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. الدفع والاشتراك (المساهمات الطوعية)</h2>
            <p className="mb-2">عند تقديم مساهمة عبر صفحة "دعم عِتَرَةً":</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>تتم عملية الدفع عبر <span className="font-semibold">Paddle.com Market Limited</span> بصفته <span className="font-semibold">بائع التسجيل (Merchant of Record)</span> لجميع طلباتنا.</li>
              <li>يقدّم Paddle جميع خدمات العملاء المتعلقة بالدفع ويعالج طلبات الاسترداد.</li>
              <li>تنطبق <span className="font-semibold">شروط Paddle للمشترين</span> على آليات الدفع والفوترة والضرائب والإلغاء والاسترداد: <a className="text-primary underline" href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer">paddle.com/legal/checkout-buyer-terms</a>.</li>
              <li>المساهمة <span className="font-semibold">طوعية وليست رسوماً مقابل خدمة</span>؛ ولا تترتّب عليها أي ميزات إضافية أو حصرية.</li>
            </ul>
            <p className="mt-2 text-[12px] bg-muted/40 rounded-lg p-3 leading-relaxed">
              <span className="font-semibold">إفصاح بائع التسجيل:</span> تتمّ معالجة طلبنا عبر شريكنا Paddle.com، وهو <span className="font-semibold">بائع التسجيل (Merchant of Record)</span> لجميع الطلبات. يُقدّم Paddle جميع استفسارات العملاء وخدمات ما بعد الدفع، ويعالج طلبات الاسترداد.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. سياسة الاسترداد</h2>
            <p>راجع <span className="font-semibold">سياسة الاسترداد</span> الخاصة بنا في صفحة منفصلة. باختصار: نتيح فترة استرداد <span className="font-semibold">30 يوماً</span> من تاريخ المعاملة لكل المساهمات، وتُعالَج جميع طلبات الاسترداد عبر Paddle.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. حدود المسؤولية</h2>
            <p className="mb-2">المستخدم مسؤول وحده عن:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>صحّة المعلومات الدينية التي يعتمد عليها — يُنصح بمراجعة المراجع الفقهية المعتمدة.</li>
              <li>دقة أوقات الصلاة في حالات الاحتياط — يُنصح بمراجعة التقاويم المحلية.</li>
              <li>دقة اتجاه القبلة — يُنصح بمعايرة بوصلة الجهاز.</li>
            </ul>
            <p className="mt-2">إلى أقصى حدّ يسمح به القانون، نُخلي مسؤوليتنا عن أي ضرر مباشر أو غير مباشر أو عرضي أو تبعي (بما في ذلك خسارة الأرباح أو البيانات أو السمعة) ينتج عن استخدام التطبيق. لا تنطبق هذه الحدود على المسؤولية عن الاحتيال أو الوفاة أو الإصابة الشخصية حيث يُحظر ذلك قانوناً. تُحدَّد المسؤولية الإجمالية بمبلغ المساهمات المدفوعة لنا في الـ 12 شهراً السابقة (إن وُجدت).</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. تعويضات المستخدم</h2>
            <p>تُقرّ بتعويضنا عن أي مطالبات تنشأ عن انتهاكك لهذه الشروط، أو سوء استخدامك للتطبيق، أو محتوى ترفعه ينتهك حقوق طرف ثالث.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. خدمات الطرف الثالث</h2>
            <p>يعتمد التطبيق على خدمات خارجية (AlAdhan، AlQuran.cloud، wttr.in، Nominatim، Paddle، Lovable Cloud). توقّف أي منها أو تغيير سياساتها قد يؤثر على بعض الميزات. لا نضمن استمراريتها.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. الإشعارات</h2>
            <p>عند تفعيل إشعارات الأذان، فإنك توافق على عرض إشعارات محلية في أوقات الصلاة. يمكنك إيقافها في أي وقت من الإعدادات.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. الإيقاف والإنهاء</h2>
            <p>يحق لنا إيقاف أو إنهاء وصول أي مستخدم في حالات: المخالفة الجوهرية، عدم الدفع (إن وُجد التزام مالي)، مخاطر الأمان أو الاحتيال، أو الانتهاكات المتكررة. يحق لنا أيضاً سحب التطبيق من المتاجر في أي وقت ودون إشعار مسبق. يحق لك التوقف عن استخدامه وحذفه في أي لحظة دون أي التزام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">13. تعديل الشروط</h2>
            <p>يحق لنا تحديث هذه الشروط في أي وقت. سيظهر تاريخ آخر تحديث في أعلى الصفحة. استمرارك في استخدام التطبيق بعد التحديث يُعدّ موافقة ضمنية على البنود الجديدة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">14. القانون الحاكم وحلّ النزاعات</h2>
            <p>تخضع هذه الشروط لقوانين <span className="font-semibold">المملكة العربية السعودية</span>، ويختصّ القضاء السعودي بأي نزاع ينشأ عنها. تُبذل محاولة جادّة لحلّ النزاع ودياً قبل اللجوء إلى القضاء.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">15. القوة القاهرة</h2>
            <p>لا يُعدّ أيٌّ من الطرفين مسؤولاً عن الإخفاق في الأداء بسبب أحداث خارجة عن السيطرة المعقولة (كوارث طبيعية، حرب، قطع إنترنت واسع، أعطال البنية التحتية للسحابة).</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">16. التواصل</h2>
            <p><span className="font-semibold">Bin Jaafar</span><br />البريد: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              These Terms govern your use of the <span className="font-semibold">Atraa</span> app (عِتَرَةً) and related website (atraa.xyz), provided by the individual developer <span className="font-semibold">Bin Jaafar</span>. By using the app you confirm that you have read, understood, and fully accepted these Terms. If you do not agree with any clause, please stop using the app immediately.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Parties & Acceptance</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>You are contracting with <span className="font-semibold">Bin Jaafar</span> ("we" or "the developer").</li>
              <li>By continued use of the service you agree to these Terms.</li>
              <li>If you use the app on behalf of an organization, you confirm you have authority to bind that organization.</li>
              <li>You must be of legal age in your country or have parental consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Service Description</h2>
            <p>Atraa is a religious app providing: prayer times (Ja’fari calculation), Qibla direction, Hijri calendar, supplications, ziyarat, adhkar, digital tasbih, and Quran display in Uthmani script. The app is fully free and does not require a subscription or account registration. A <span className="font-semibold">"Support Atraa"</span> page receives optional voluntary contributions as a token of appreciation — not as a fee for an additional service.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Misuse</h2>
            <p className="mb-2">You undertake not to use the app:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>For any unlawful purpose or in violation of local or international laws.</li>
              <li>For fraud or sending unsolicited messages.</li>
              <li>To harm the service, attempt to hack it, or gain unauthorised access (malware, probing, scraping).</li>
              <li>To copy protected content, resell, or commercially redistribute it without written permission.</li>
              <li>To infringe any third party’s intellectual-property rights.</li>
              <li>In a way that conflicts with Apple App Store or Google Play Store policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Intellectual Property</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Religious texts</span> (Quran, duas, ziyarat, adhkar): sourced from Islamic heritage and are public domain. Quran source: King Fahd Glorious Quran Printing Complex via AlQuran.cloud. Duas: Haqibat al-Mu’min.</li>
              <li><span className="font-semibold">App design, code, icons, seasonal logos, and branding</span>: protected IP of <span className="font-semibold">Bin Jaafar</span>. May not be reused without written permission.</li>
              <li><span className="font-semibold">Trademarks</span> of third-party services (AlAdhan, AlQuran.cloud, Paddle, Vercel, Lovable, etc.) belong to their owners.</li>
            </ul>
            <p className="mt-2">You are granted a <span className="font-semibold">limited, non-exclusive, non-transferable</span> license to use the app for personal purposes only.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Service Level</h2>
            <p>We do our best to keep the app available and reliable, but we <span className="font-semibold">do not guarantee</span> that the service will be uninterrupted, error-free, or compatible with every device or operating system.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Voluntary Contributions</h2>
            <p className="mb-2">Atraa is offered free of charge. Users may, at their sole discretion, send voluntary contributions to support development and maintenance of the app. Contributions are <span className="font-semibold">voluntary donations, not a fee for service</span>; they do not unlock additional, premium, or exclusive features. The full app remains available to all users regardless of contribution status.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Limitation of Liability</h2>
            <p className="mb-2">The user alone is responsible for:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>The accuracy of religious information they rely on — consult qualified jurisprudential references.</li>
              <li>Prayer-time accuracy in cases of caution — consult local timetables.</li>
              <li>Qibla direction accuracy — calibrate device compass.</li>
            </ul>
            <p className="mt-2">To the fullest extent permitted by law, we disclaim liability for any direct, indirect, incidental, or consequential damage (including loss of profits, data, or goodwill) arising from app use. These limits do not apply to liability for fraud, death, or personal injury where prohibited by law. Aggregate liability is capped at the amount of contributions paid to us in the prior 12 months (if any).</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. User Indemnity</h2>
            <p>You agree to indemnify us against any claim arising from your breach of these Terms, your misuse of the app, or content you submit that infringes a third party’s rights.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. Third-Party Services</h2>
            <p>The app relies on external services (AlAdhan, AlQuran.cloud, wttr.in, Nominatim, Paddle, Lovable Cloud). The discontinuation or policy change of any of them may affect some features. We do not guarantee their continuity.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. Notifications</h2>
            <p>By enabling adhan notifications you agree the app may display local notifications at prayer times. You can disable them at any time from app settings.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. Suspension & Termination</h2>
            <p>We may suspend or terminate access for: material breach, non-payment (where applicable), security/fraud risk, or repeated/serious policy violations. We may also remove the app from stores at any time without prior notice. You may stop using and delete it at any moment without obligation.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">13. Changes to Terms</h2>
            <p>We may update these Terms at any time. The last-updated date appears at the top. Continued use of the app after changes constitutes implicit acceptance of the new clauses.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">14. Governing Law & Dispute Resolution</h2>
            <p>These Terms are governed by the laws of the <span className="font-semibold">Kingdom of Saudi Arabia</span>, and Saudi courts have jurisdiction over any disputes arising from them. A good-faith attempt at amicable resolution shall be made before resorting to courts.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">15. Force Majeure</h2>
            <p>Neither party is liable for failure to perform due to events beyond reasonable control (natural disasters, war, broad internet outages, cloud-infrastructure failures).</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">16. Contact</h2>
            <p><span className="font-semibold">Bin Jaafar</span><br />Email: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default TermsPage;
