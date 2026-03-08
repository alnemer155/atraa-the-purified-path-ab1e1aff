const PoliciesPage = () => {
  return (
    <div className="px-4 py-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground">السياسات</h1>

      {/* Privacy Policy */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-3">سياسة الخصوصية</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
          <p><strong className="text-foreground">البيانات المحفوظة:</strong> يتم حفظ اسمك ولقبك وبريدك الإلكتروني (إن أُدخل) وإعداداتك على جهازك فقط (محلياً) ولا يتم إرسالها إلى أي خادم خارجي.</p>
          <p><strong className="text-foreground">أوقات الصلاة:</strong> يتم جلب أوقات الصلاة من واجهة Aladhan API. المطور لا يتحكم في دقة البيانات المقدمة.</p>
          <p><strong className="text-foreground">الطقس:</strong> يتم جلب بيانات الطقس بناءً على المدينة المختارة أو الموقع الجغرافي. يُستخدم الموقع فقط لتحديد المدينة ولا يتم تخزينه أو مشاركته.</p>
          <p><strong className="text-foreground">اتجاه القبلة:</strong> يُستخدم الموقع الجغرافي لحساب اتجاه القبلة فقط، ولا يتم تخزينه أو إرساله لأي جهة.</p>
          <p><strong className="text-foreground">الإشعارات:</strong> عند تفعيلها، تُرسل تذكيرات الأذان والأذكار والصلوات محلياً على جهازك. لا يتم جمع أي بيانات من خلال الإشعارات.</p>
          <p><strong className="text-foreground">التسبيح والقراءة:</strong> يتم حفظ تقدمك في التسبيح وآخر قراءة محلياً على جهازك لتسهيل المتابعة.</p>
          <p>لا نشارك أي بيانات مع أطراف ثالثة. جميع البيانات تبقى على جهازك.</p>
        </div>
      </div>

      {/* Terms of Use */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-3">شروط الاستخدام</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>باستخدامك لتطبيق عِتْرَة، فإنك توافق على الشروط التالية:</p>
          <p><strong className="text-foreground">الغرض:</strong> التطبيق مخصص للاستخدام الشخصي في العبادات والأدعية والأذكار والزيارات.</p>
          <p><strong className="text-foreground">المحتوى الديني:</strong> النصوص الدينية مأخوذة من مصادر موثوقة. يُنصح بالرجوع إلى العلماء والمراجع للتحقق والتأكد.</p>
          <p><strong className="text-foreground">أوقات الصلاة:</strong> البيانات مقدمة من مصادر خارجية (Aladhan API) وقد تحتاج لتعديل يدوي. يمكنك ضبط التاريخ الهجري من الإعدادات.</p>
          <p><strong className="text-foreground">الطقس:</strong> بيانات الطقس مقدمة من مصادر خارجية وتُعرض للاستدلال فقط.</p>
          <p><strong className="text-foreground">اتجاه القبلة:</strong> يعتمد على حساسات الجهاز وقد يحتاج إلى معايرة. يُنصح بالتأكد من الاتجاه بطرق إضافية.</p>
          <p><strong className="text-foreground">الإشعارات:</strong> تذكيرات الصلوات والأذكار تقريبية وقد تتأثر بإعدادات الجهاز ونظام التشغيل.</p>
          <p><strong className="text-foreground">المسؤولية:</strong> التطبيق يُقدم كما هو بدون ضمانات. المطور غير مسؤول عن أي أخطاء في المحتوى أو البيانات.</p>
        </div>
      </div>

      {/* Developer */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-2">المطوّر</h2>
        <p className="text-sm text-muted-foreground">عبدالله بن جعفر (Abdullah Bin Jaafar)</p>
        <p className="text-xs text-muted-foreground mt-2">للتواصل: a.jaafar.dev@gmail.com</p>
      </div>
    </div>
  );
};

export default PoliciesPage;
