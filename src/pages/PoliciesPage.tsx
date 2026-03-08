const PoliciesPage = () => {
  return (
    <div className="px-4 py-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground">السياسات</h1>

      {/* Privacy Policy */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-3">سياسة الخصوصية</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
          <p><strong className="text-foreground">البيانات المحفوظة:</strong> يتم حفظ اسمك ولقبك على جهازك فقط (محلياً) ولا يتم إرسالها إلى أي خادم.</p>
          <p><strong className="text-foreground">أوقات الصلاة:</strong> يتم جلب أوقات الصلاة من واجهة Aladhan API باستخدام إحداثيات جغرافية محددة.</p>
          <p><strong className="text-foreground">الذكاء الاصطناعي:</strong> الأسئلة المرسلة تُعالج عبر خدمة Perplexity AI لتقديم إجابات دينية.</p>
          <p><strong className="text-foreground">الموقع الجغرافي:</strong> يُستخدم فقط لتحديد اتجاه القبلة، ولا يتم تخزينه.</p>
          <p>لا نشارك أي بيانات مع أطراف ثالثة.</p>
        </div>
      </div>

      {/* Terms of Use */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-3">شروط الاستخدام</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>باستخدامك لتطبيق عِتْرَة، فإنك توافق على الشروط التالية:</p>
          <p><strong className="text-foreground">الغرض:</strong> التطبيق مخصص للاستخدام الشخصي في العبادات والأدعية والأذكار.</p>
          <p><strong className="text-foreground">المحتوى الديني:</strong> النصوص الدينية مأخوذة من مصادر موثوقة. يُنصح بالرجوع إلى العلماء للتأكد.</p>
          <p><strong className="text-foreground">أوقات الصلاة:</strong> المطور لا يتحكم في دقة أوقات الصلاة. البيانات مقدمة من Aladhan API.</p>
          <p><strong className="text-foreground">الذكاء الاصطناعي:</strong> الإجابات استرشادية وليست فتاوى شرعية. يُرجى مراجعة المرجع الديني المختص.</p>
          <p><strong className="text-foreground">المسؤولية:</strong> التطبيق يُقدم كما هو بدون ضمانات. المطور غير مسؤول عن أي أخطاء في المحتوى أو البيانات.</p>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
