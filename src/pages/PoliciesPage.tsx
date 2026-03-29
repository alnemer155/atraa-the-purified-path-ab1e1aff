import { ChevronLeft, Shield, FileText, Scale, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-2xl shadow-card p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
        <Icon className="w-[18px] h-[18px] text-primary" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const Item = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-secondary/40 rounded-xl p-3">
    <p className="text-xs font-semibold text-foreground mb-1">{title}</p>
    <p className="text-[12px] text-muted-foreground leading-relaxed">{children}</p>
  </div>
);

const PoliciesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">السياسات والشروط</h1>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary hover:bg-primary/10 transition-colors">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="bg-primary-light rounded-xl p-3 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">
          خصوصيتك أولوية قصوى. جميع بياناتك الشخصية تُخزّن محلياً على جهازك فقط ولا تُرسل لأي خادم خارجي. بيانات المسابقة تُخزّن بشكل مشفّر على خوادم آمنة.
        </p>
      </div>

      {/* Privacy Policy */}
      <Section icon={Shield} title="سياسة الخصوصية">
        <Item title="البيانات الشخصية">
          يتم حفظ اسمك ولقبك وبريدك الإلكتروني (إن أُدخل) وإعداداتك على جهازك فقط (محلياً). لا يتم إرسالها أو مشاركتها مع أي طرف ثالث تحت أي ظرف.
        </Item>
        <Item title="بيانات المسابقة">
          عند التسجيل في مسابقة عِتْرَة، يتم حفظ لقبك والإيموجي والنبذة (إن اخترت عرضها) والعمر ونتائجك على خوادم آمنة. لا يتم ربط هذه البيانات بهويتك الحقيقية. معرّف الجهاز المستخدم مجهول الهوية تماماً.
        </Item>
        <Item title="أوقات الصلاة والطقس">
          يتم جلب أوقات الصلاة من واجهة Aladhan API والطقس من مصادر خارجية. لا يتم تخزين موقعك الجغرافي أو مشاركته مع أي جهة. المطور لا يتحكم في دقة البيانات المقدمة من هذه المصادر.
        </Item>
        <Item title="الإشعارات">
          عند تفعيلها، تُرسل التذكيرات محلياً على جهازك. لا يتم جمع أي بيانات من خلال الإشعارات.
        </Item>
        <Item title="مشاركة البيانات">
          لا نبيع أو نشارك أو نؤجر أي بيانات شخصية مع أطراف ثالثة تحت أي ظرف. جميع البيانات الشخصية تبقى على جهازك.
        </Item>
      </Section>

      {/* Terms of Use */}
      <Section icon={FileText} title="شروط الاستخدام">
        <Item title="الغرض">
          التطبيق مخصص حصرياً للاستخدام الشخصي في العبادات والأدعية والأذكار والزيارات والمعرفة الدينية. يُمنع منعاً باتاً استخدامه لأي غرض تجاري أو ترويجي.
        </Item>
        <Item title="المحتوى الديني">
          النصوص الدينية مأخوذة من مصادر موثوقة ومعتمدة. يتحمل المستخدم مسؤولية التحقق والرجوع إلى العلماء والمراجع الدينية المعتمدة.
        </Item>
        <Item title="أوقات الصلاة والتاريخ الهجري">
          البيانات مقدمة من مصادر خارجية (Aladhan API) وهي تقريبية. المطور لا يضمن دقتها المطلقة. يمكنك ضبط التاريخ الهجري يدوياً من الإعدادات.
        </Item>
        <Item title="اتجاه القبلة">
          يعتمد على حساسات الجهاز وقد يحتاج إلى معايرة دورية. يُنصح بشدة بالتأكد من الاتجاه بطرق إضافية. المطور غير مسؤول عن أي خطأ في تحديد الاتجاه.
        </Item>
        <Item title="المسؤولية">
          التطبيق يُقدم "كما هو" بدون أي ضمانات صريحة أو ضمنية. المطور غير مسؤول عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام التطبيق أو الاعتماد على بياناته.
        </Item>
      </Section>

      {/* Quiz Terms */}
      <Section icon={Trophy} title="شروط مسابقة عِتْرَة">
        <Item title="التسجيل والمشاركة">
          التسجيل متاح لمن تتراوح أعمارهم بين ١٢ و ٦٠ سنة. بالتسجيل، يوافق المشارك على جميع شروط وسياسات الموقع. التسجيل يتم باستخدام معرّف جهاز مجهول الهوية.
        </Item>
        <Item title="الأسئلة والذكاء الاصطناعي">
          ⚠️ أسئلة المسابقة يتم توليدها بواسطة الذكاء الاصطناعي (نماذج لغوية كبيرة). المطور لا يضمن صحة أو دقة الأسئلة والإجابات المولّدة. قد تحتوي الأسئلة على أخطاء أو معلومات غير دقيقة. المشارك يتحمل مسؤولية التحقق من المعلومات بشكل مستقل.
        </Item>
        <Item title="النقاط والتصنيف">
          لكل سؤال صحيح نقطتان. النقاط الإضافية (هدايا الجمعة والمناسبات) تُمنح تلقائياً. ترتيب المتصدرين يعتمد على مجموع النقاط. المطور يحتفظ بحق تعديل نظام النقاط.
        </Item>
        <Item title="الفترة الزمنية">
          المسابقة تمتد من ٢١ مارس حتى ٢١ مايو ٢٠٢٦. الأسئلة اليومية متاحة من ٩:٠٠ صباحاً حتى ٩:٣٠ مساءً بتوقيت الرياض. بعد ٩:٣١ مساءً تُقفل الأسئلة.
        </Item>
        <Item title="السلوك">
          يُمنع استخدام أي وسائل غش أو تلاعب. يحق للمطور إيقاف أو حذف أي حساب يُشتبه في مخالفته. القرارات نهائية وغير قابلة للاستئناف.
        </Item>
      </Section>

      {/* Disclaimer */}
      <Section icon={Scale} title="إخلاء المسؤولية الشامل">
        <p className="text-xs text-muted-foreground leading-relaxed">
          تطبيق عِتْرَة يُقدم المحتوى الديني كمرجع مساعد وليس بديلاً عن المراجع الدينية المعتمدة. المطور يبذل أقصى جهده لضمان دقة المعلومات لكن لا يتحمل أي مسؤولية قانونية أو شرعية عن أي أخطاء قد ترد.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          <strong className="text-foreground">إخلاء مسؤولية الذكاء الاصطناعي:</strong> أسئلة المسابقة وتلميحاتها مولّدة بالكامل بواسطة نماذج الذكاء الاصطناعي. هذه النماذج قد تُنتج معلومات خاطئة أو مضللة. المطور لا يتحمل أي مسؤولية عن دقة أو صحة المحتوى المولّد. يُنصح المستخدم بالتحقق من جميع المعلومات من مصادر دينية معتمدة ومراجع موثوقة.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          باستخدام التطبيق أو المشاركة في المسابقة، تقر بقراءة وفهم وموافقتك على جميع الشروط والسياسات المذكورة أعلاه.
        </p>
      </Section>

      {/* Developer */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">المطوّر</h2>
        <p className="text-xs text-muted-foreground">عبدالله بن جعفر (Abdullah Bin Jaafar)</p>
        <p className="text-[11px] text-muted-foreground mt-2">للتواصل: a.jaafar.dev@gmail.com</p>
      </div>

      <div className="text-center pb-6 pt-2">
        <p className="text-[10px] text-muted-foreground/60">آخر تحديث: مارس ٢٠٢٦ · الإصدار v3.0</p>
      </div>
    </div>
  );
};

export default PoliciesPage;
