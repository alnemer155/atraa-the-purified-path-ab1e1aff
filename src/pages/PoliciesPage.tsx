import { ChevronLeft, Shield, FileText, Scale } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">السياسات والشروط</h1>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary hover:bg-primary/10 transition-colors">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="bg-primary-light rounded-xl p-3 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">
          خصوصيتك أولوية. جميع بياناتك تُخزّن محلياً على جهازك فقط ولا تُرسل لأي خادم خارجي.
        </p>
      </div>

      {/* Privacy Policy */}
      <Section icon={Shield} title="سياسة الخصوصية">
        <Item title="البيانات المحفوظة">
          يتم حفظ اسمك ولقبك وبريدك الإلكتروني (إن أُدخل) وإعداداتك على جهازك فقط (محلياً) ولا يتم إرسالها إلى أي خادم خارجي.
        </Item>
        <Item title="أوقات الصلاة">
          يتم جلب أوقات الصلاة من واجهة Aladhan API. المطور لا يتحكم في دقة البيانات المقدمة.
        </Item>
        <Item title="الطقس والموقع">
          يُستخدم الموقع الجغرافي لتحديد المدينة وحساب اتجاه القبلة فقط. لا يتم تخزينه أو مشاركته مع أي جهة.
        </Item>
        <Item title="الإشعارات">
          عند تفعيلها، تُرسل التذكيرات محلياً على جهازك. لا يتم جمع أي بيانات من خلال الإشعارات.
        </Item>
        <Item title="التسبيح والقراءة">
          يتم حفظ تقدمك محلياً على جهازك لتسهيل المتابعة.
        </Item>
        <Item title="مشاركة البيانات">
          لا نشارك أي بيانات مع أطراف ثالثة. جميع البيانات تبقى على جهازك.
        </Item>
      </Section>

      {/* Terms of Use */}
      <Section icon={FileText} title="شروط الاستخدام">
        <Item title="الغرض">
          التطبيق مخصص للاستخدام الشخصي في العبادات والأدعية والأذكار والزيارات.
        </Item>
        <Item title="المحتوى الديني">
          النصوص الدينية مأخوذة من مصادر موثوقة. يُنصح بالرجوع إلى العلماء والمراجع للتحقق والتأكد.
        </Item>
        <Item title="أوقات الصلاة والتاريخ الهجري">
          البيانات مقدمة من مصادر خارجية (Aladhan API) وقد تحتاج لتعديل يدوي. يمكنك ضبط التاريخ الهجري من الإعدادات.
        </Item>
        <Item title="الطقس">
          بيانات الطقس مقدمة من مصادر خارجية وتُعرض للاستدلال فقط.
        </Item>
        <Item title="اتجاه القبلة">
          يعتمد على حساسات الجهاز وقد يحتاج إلى معايرة. يُنصح بالتأكد من الاتجاه بطرق إضافية.
        </Item>
        <Item title="الإشعارات">
          تذكيرات الصلوات والأذكار تقريبية وقد تتأثر بإعدادات الجهاز ونظام التشغيل.
        </Item>
        <Item title="المسؤولية">
          التطبيق يُقدم كما هو بدون ضمانات. المطور غير مسؤول عن أي أخطاء في المحتوى أو البيانات.
        </Item>
      </Section>

      {/* Disclaimer */}
      <Section icon={Scale} title="إخلاء المسؤولية">
        <p className="text-xs text-muted-foreground leading-relaxed">
          تطبيق عِتْرَة يُقدم المحتوى الديني كمرجع مساعد وليس بديلاً عن المراجع الدينية المعتمدة. المطور يبذل جهده لضمان دقة المعلومات لكن لا يتحمل مسؤولية أي أخطاء قد ترد.
        </p>
      </Section>

      {/* Developer */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">المطوّر</h2>
        <p className="text-xs text-muted-foreground">عبدالله بن جعفر (Abdullah Bin Jaafar)</p>
        <p className="text-[11px] text-muted-foreground mt-2">للتواصل: a.jaafar.dev@gmail.com</p>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 pt-2">
        <p className="text-[10px] text-muted-foreground/60">آخر تحديث: مارس ٢٠٢٦</p>
      </div>
    </div>
  );
};

export default PoliciesPage;
