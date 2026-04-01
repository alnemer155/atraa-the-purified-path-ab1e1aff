import { ChevronLeft, Shield, FileText, Scale, Trophy, Bot, Lock, Copyright } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-2xl shadow-card border border-border/30 p-4">
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
    </div>
    <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const Item = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-secondary/30 rounded-xl p-3">
    <p className="text-[11px] font-semibold text-foreground mb-0.5">{title}</p>
    <p className="text-[11px] text-muted-foreground leading-relaxed">{children}</p>
  </div>
);

const PoliciesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">السياسات والشروط</h1>
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-secondary/50 hover:bg-primary/8 transition-colors">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="bg-primary/6 rounded-xl p-3 flex items-start gap-2">
        <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-foreground leading-relaxed">
          خصوصيتك أولوية قصوى. جميع بياناتك الشخصية تُخزّن محلياً على جهازك فقط ولا تُرسل لأي خادم خارجي إلا عند استخدام خدمة الذكاء الاصطناعي.
        </p>
      </div>

      <Section icon={Shield} title="سياسة الخصوصية">
        <Item title="البيانات الشخصية">
          يتم حفظ اسمك ولقبك وبريدك الإلكتروني على جهازك فقط (محلياً). لا يتم إرسالها أو مشاركتها مع أي طرف ثالث.
        </Item>
        <Item title="بيانات المسابقة">
          عند التسجيل في المسابقة، يتم حفظ لقبك والإيموجي والنبذة والعمر ونتائجك على خوادم آمنة. معرّف الجهاز مجهول الهوية ولا يمكن ربطه بهويتك الحقيقية.
        </Item>
        <Item title="بيانات الذكاء الاصطناعي">
          عند استخدام خدمة ذكاء عِتَرَةً، تُرسل رسائلك إلى خوادم آمنة لمعالجتها. يتم حفظ سجل المحادثات مرتبطاً بمعرّف جهازك فقط. لا نستخدم محادثاتك لتدريب نماذج الذكاء الاصطناعي.
        </Item>
        <Item title="أوقات الصلاة والطقس">
          يتم جلب البيانات من مصادر خارجية (Aladhan API). لا يتم تخزين موقعك الجغرافي الدقيق أو مشاركته مع أطراف ثالثة.
        </Item>
        <Item title="الإشعارات">
          عند تفعيلها، تُرسل التذكيرات محلياً على جهازك. لا يتم جمع أي بيانات متعلقة بالإشعارات.
        </Item>
        <Item title="ملفات تعريف الارتباط (Cookies)">
          لا نستخدم ملفات تعريف الارتباط لتتبعك. نستخدم التخزين المحلي (localStorage) فقط لحفظ إعداداتك.
        </Item>
        <Item title="مشاركة البيانات">
          لا نبيع أو نشارك أو نؤجر أي بيانات شخصية مع أطراف ثالثة تحت أي ظرف.
        </Item>
        <Item title="حذف البيانات">
          يمكنك حذف جميع بياناتك المحلية بمسح بيانات المتصفح. لحذف بيانات المسابقة أو المحادثات، تواصل معنا عبر البريد.
        </Item>
      </Section>

      <Section icon={FileText} title="شروط الاستخدام">
        <Item title="الغرض">
          التطبيق مخصص للاستخدام الشخصي في العبادات والمعرفة الدينية الإسلامية. يُمنع استخدامه لأي غرض تجاري أو ربحي بدون إذن خطي.
        </Item>
        <Item title="المحتوى الديني">
          النصوص مأخوذة من مصادر موثوقة في المدرسة الجعفرية. يتحمل المستخدم مسؤولية التحقق والرجوع إلى المراجع المعتمدة والعلماء.
        </Item>
        <Item title="أوقات الصلاة">
          البيانات تقريبية من Aladhan API وقد يكون فيها فارق دقائق. يمكنك ضبط التاريخ الهجري يدوياً من الإعدادات.
        </Item>
        <Item title="اتجاه القبلة">
          يعتمد على حساسات الجهاز (البوصلة) وقد يحتاج إلى معايرة. يُنصح بالتأكد بطرق إضافية خاصة في المرة الأولى.
        </Item>
        <Item title="السلوك المقبول">
          يُمنع استخدام التطبيق بطريقة مسيئة أو مخالفة للآداب الإسلامية. يحق لنا إيقاف أي حساب مخالف.
        </Item>
        <Item title="التعديلات">
          نحتفظ بالحق في تعديل هذه الشروط في أي وقت. الاستمرار في استخدام التطبيق يعني الموافقة على التعديلات.
        </Item>
        <Item title="المسؤولية">
          التطبيق يُقدم "كما هو" بدون ضمانات من أي نوع. المطور غير مسؤول عن أي أضرار مباشرة أو غير مباشرة.
        </Item>
      </Section>

      <Section icon={Bot} title="سياسة استخدام الذكاء الاصطناعي">
        <Item title="نطاق الخدمة">
          ذكاء عِتَرَةً (حُسين ومهدي) متخصص في الأسئلة الدينية والإسلامية من منظور المدرسة الجعفرية فقط. لن يجيب على أسئلة خارج هذا النطاق.
        </Item>
        <Item title="دقة المعلومات">
          ⚠️ الإجابات مولّدة بالذكاء الاصطناعي وقد تحتوي على أخطاء أو معلومات غير دقيقة. يجب التحقق من المصادر الأصلية والرجوع إلى العلماء والمراجع المعتمدة.
        </Item>
        <Item title="المصادر">
          يعتمد الذكاء الاصطناعي على مصادر إسلامية معروفة مثل القرآن الكريم ونهج البلاغة والكافي وبحار الأنوار. المصادر المذكورة استرشادية وليست اقتباسات حرفية دائماً.
        </Item>
        <Item title="الاستخدام المحظور">
          يُمنع استخدام الذكاء الاصطناعي لتوليد فتاوى شرعية نهائية أو محتوى مسيء أو تحريضي أو لأي غرض يخالف القيم الإسلامية.
        </Item>
        <Item title="حفظ المحادثات">
          تُحفظ المحادثات لتحسين تجربتك. يمكنك حذفها في أي وقت من سجل المحادثات. لا نستخدم محادثاتك لتدريب النماذج.
        </Item>
        <Item title="حدود الاستخدام">
          قد تُفرض حدود على عدد الرسائل لضمان جودة الخدمة للجميع. سيتم إبلاغك عند الاقتراب من الحد.
        </Item>
        <Item title="إخلاء مسؤولية">
          الذكاء الاصطناعي أداة مساعدة وليس بديلاً عن العلماء والمراجع الدينية. المطور غير مسؤول عن أي قرارات تُتخذ بناءً على إجابات الذكاء الاصطناعي.
        </Item>
      </Section>

      <Section icon={Trophy} title="شروط مسابقة عِتَرَةً">
        <Item title="التسجيل">
          التسجيل متاح لمن بين ١٢ و ٦٠ سنة. بالتسجيل يوافق المشارك على جميع الشروط والسياسات. لا يمكن تعديل العمر أو إلغاء الموافقة بعد التسجيل.
        </Item>
        <Item title="الأسئلة والذكاء الاصطناعي">
          ⚠️ الأسئلة مولّدة بالذكاء الاصطناعي وقد تحتوي أخطاء. المشارك يتحمل مسؤولية التحقق من صحة المعلومات.
        </Item>
        <Item title="النقاط والتسجيل">
          لكل سؤال صحيح نقطتان. النقاط الإضافية تُمنح تلقائياً في المناسبات والأيام الخاصة. لا يمكن استبدال النقاط بأي مقابل مادي.
        </Item>
        <Item title="الفترة والتوقيت">
          من ٢١ مارس حتى ٢١ مايو ٢٠٢٦. الأسئلة متاحة من ٩:٠٠ ص حتى ٩:٣٠ م بتوقيت الرياض. مدة الجولة ٣ دقائق.
        </Item>
        <Item title="السلوك والنزاهة">
          يُمنع الغش أو استخدام أدوات خارجية أو إنشاء حسابات متعددة. يحق للمطور إيقاف أي حساب مخالف بدون إنذار. جميع القرارات نهائية وغير قابلة للطعن.
        </Item>
      </Section>

      <Section icon={Lock} title="أمن المعلومات">
        <Item title="التشفير">
          جميع الاتصالات بين التطبيق والخوادم مشفرة باستخدام بروتوكول HTTPS/TLS.
        </Item>
        <Item title="حماية البيانات">
          بيانات المستخدمين محمية بسياسات أمنية صارمة. لا يمكن الوصول إليها إلا من قبل الأنظمة المصرّح لها.
        </Item>
        <Item title="معرّف الجهاز">
          نستخدم معرّف جهاز عشوائي مجهول الهوية (UUID) لا يمكن ربطه بهويتك الحقيقية أو معلومات جهازك.
        </Item>
      </Section>

      <Section icon={Copyright} title="حقوق الملكية الفكرية">
        <Item title="حقوق المطور">
          جميع حقوق التصميم والبرمجة والمحتوى الأصلي محفوظة للمطور عبدالله بن جعفر. يُمنع نسخ أو إعادة إنتاج أي جزء من التطبيق بدون إذن خطي.
        </Item>
        <Item title="العلامة التجارية">
          اسم "عِتَرَةً" وشعاره وتصميمه علامات تجارية محمية. أي استخدام غير مصرّح به يعرّض صاحبه للمساءلة القانونية.
        </Item>
        <Item title="المحتوى المقدس">
          النصوص القرآنية والأحاديث الشريفة والأدعية ملك للأمة الإسلامية. التطبيق يعرضها كخدمة دون ادعاء ملكيتها.
        </Item>
        <Item title="الإبلاغ عن انتهاكات">
          لأي بلاغ عن انتهاك حقوق ملكية فكرية، تواصل معنا عبر البريد: a.jaafar.dev@gmail.com
        </Item>
      </Section>

      <Section icon={Scale} title="إخلاء المسؤولية العام">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          تطبيق عِتَرَةً مرجع مساعد وليس بديلاً عن المراجع المعتمدة والعلماء. جميع المحتويات المولّدة بالذكاء الاصطناعي (أسئلة المسابقة، إجابات حُسين ومهدي) قد تكون غير دقيقة ويجب التحقق منها.
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
          المطور غير مسؤول عن: دقة أوقات الصلاة، دقة اتجاه القبلة، صحة إجابات الذكاء الاصطناعي، أي قرارات تُتخذ بناءً على محتوى التطبيق، أي أضرار مباشرة أو غير مباشرة ناتجة عن الاستخدام.
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
          باستخدام التطبيق أو أي من خدماته تقر بموافقتك الكاملة على جميع الشروط والسياسات المذكورة أعلاه.
        </p>
      </Section>

      <div className="bg-card rounded-2xl shadow-card border border-border/30 p-4">
        <h2 className="text-sm font-semibold text-foreground mb-0.5">المطوّر</h2>
        <p className="text-[11px] text-muted-foreground">عبدالله بن جعفر · a.jaafar.dev@gmail.com</p>
      </div>

      <div className="text-center pb-6 pt-1">
        <p className="text-[9px] text-muted-foreground/50">آخر تحديث: أبريل ٢٠٢٦ · v4.0</p>
      </div>
    </div>
  );
};

export default PoliciesPage;
