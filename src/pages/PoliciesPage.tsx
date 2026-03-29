import { ChevronLeft, Shield, FileText, Scale, Trophy } from 'lucide-react';
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
          خصوصيتك أولوية قصوى. جميع بياناتك الشخصية تُخزّن محلياً على جهازك فقط ولا تُرسل لأي خادم خارجي.
        </p>
      </div>

      <Section icon={Shield} title="سياسة الخصوصية">
        <Item title="البيانات الشخصية">
          يتم حفظ اسمك ولقبك وبريدك الإلكتروني على جهازك فقط (محلياً). لا يتم إرسالها أو مشاركتها مع أي طرف ثالث.
        </Item>
        <Item title="بيانات المسابقة">
          عند التسجيل في المسابقة، يتم حفظ لقبك والإيموجي والنبذة والعمر ونتائجك على خوادم آمنة. معرّف الجهاز مجهول الهوية.
        </Item>
        <Item title="أوقات الصلاة والطقس">
          يتم جلب البيانات من مصادر خارجية. لا يتم تخزين موقعك الجغرافي أو مشاركته.
        </Item>
        <Item title="الإشعارات">
          عند تفعيلها، تُرسل التذكيرات محلياً على جهازك. لا يتم جمع أي بيانات.
        </Item>
        <Item title="مشاركة البيانات">
          لا نبيع أو نشارك أي بيانات شخصية مع أطراف ثالثة.
        </Item>
      </Section>

      <Section icon={FileText} title="شروط الاستخدام">
        <Item title="الغرض">
          التطبيق مخصص للاستخدام الشخصي في العبادات والمعرفة الدينية. يُمنع استخدامه لأي غرض تجاري.
        </Item>
        <Item title="المحتوى الديني">
          النصوص مأخوذة من مصادر موثوقة. يتحمل المستخدم مسؤولية التحقق والرجوع إلى المراجع المعتمدة.
        </Item>
        <Item title="أوقات الصلاة">
          البيانات تقريبية من Aladhan API. يمكنك ضبط التاريخ الهجري يدوياً من الإعدادات.
        </Item>
        <Item title="اتجاه القبلة">
          يعتمد على حساسات الجهاز وقد يحتاج إلى معايرة. يُنصح بالتأكد بطرق إضافية.
        </Item>
        <Item title="المسؤولية">
          التطبيق يُقدم "كما هو" بدون ضمانات. المطور غير مسؤول عن أي أضرار.
        </Item>
      </Section>

      <Section icon={Trophy} title="شروط مسابقة عِتَرَةً">
        <Item title="التسجيل">
          التسجيل متاح لمن بين ١٢ و ٦٠ سنة. بالتسجيل يوافق المشارك على الشروط.
        </Item>
        <Item title="الأسئلة والذكاء الاصطناعي">
          ⚠️ الأسئلة مولّدة بالذكاء الاصطناعي وقد تحتوي أخطاء. المشارك يتحمل مسؤولية التحقق.
        </Item>
        <Item title="النقاط">
          لكل سؤال صحيح نقطتان. النقاط الإضافية تُمنح تلقائياً في المناسبات.
        </Item>
        <Item title="الفترة">
          من ٢١ مارس حتى ٢١ مايو ٢٠٢٦. الأسئلة من ٩ ص حتى ٩:٣٠ م بتوقيت الرياض.
        </Item>
        <Item title="السلوك">
          يُمنع الغش. يحق للمطور إيقاف أي حساب مخالف. القرارات نهائية.
        </Item>
      </Section>

      <Section icon={Scale} title="إخلاء المسؤولية">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          تطبيق عِتَرَةً مرجع مساعد وليس بديلاً عن المراجع المعتمدة. أسئلة المسابقة مولّدة بالذكاء الاصطناعي وقد تكون غير دقيقة. يُنصح بالتحقق من مصادر موثوقة.
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
          باستخدام التطبيق تقر بموافقتك على جميع الشروط والسياسات.
        </p>
      </Section>

      <div className="bg-card rounded-2xl shadow-card border border-border/30 p-4">
        <h2 className="text-sm font-semibold text-foreground mb-0.5">المطوّر</h2>
        <p className="text-[11px] text-muted-foreground">عبدالله بن جعفر · a.jaafar.dev@gmail.com</p>
      </div>

      <div className="text-center pb-6 pt-1">
        <p className="text-[9px] text-muted-foreground/50">آخر تحديث: مارس ٢٠٢٦ · v3.0</p>
      </div>
    </div>
  );
};

export default PoliciesPage;
