import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getUser, type UserData } from '@/lib/user';
import { supabase } from '@/integrations/supabase/client';
import logoAr from '@/assets/logos/logo-ar.png';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Eye, EyeOff, ArrowRight, User, Tag, KeyRound, Shield } from 'lucide-react';

type AuthMode = 'register' | 'email-signup' | 'email-login' | 'forgot-password';

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const Registration = () => {
  const navigate = useNavigate();
  const existingUser = getUser();
  const [name, setName] = useState(existingUser?.name || '');
  const [title, setTitle] = useState<UserData['title']>(existingUser?.title || 'none');
  const [customTitle, setCustomTitle] = useState(existingUser?.customTitle || '');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [loading, setLoading] = useState(false);

  const isEditing = !!existingUser?.registered;

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
        if (!getUser()?.registered) {
          saveUser({ name: displayName, title: 'none', email: user.email || undefined, registered: true });
        }
        navigate('/');
      }
    });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveUser({
      name: name.trim(), title,
      customTitle: title === 'custom' ? customTitle.trim() : undefined,
      email: email.trim() || undefined, registered: true,
    });
    navigate('/');
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      saveUser({
        name: name.trim(), title,
        customTitle: title === 'custom' ? customTitle.trim() : undefined,
        email: email.trim(), registered: true,
      });
      toast.success('تم التسجيل بنجاح! تحقق من بريدك الإلكتروني');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || 'فشل التسجيل');
    } finally { setLoading(false); }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const user = (await supabase.auth.getUser()).data.user;
      saveUser({
        name: user?.user_metadata?.full_name || email.split('@')[0],
        title: 'none', email: email.trim(), registered: true,
      });
      toast.success('تم تسجيل الدخول');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || 'فشل تسجيل الدخول');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور');
      setAuthMode('email-login');
    } catch (e: any) {
      toast.error(e.message || 'فشل الإرسال');
    } finally { setLoading(false); }
  };

  const titleOptions: { value: UserData['title']; label: string; icon?: string }[] = [
    { value: 'سيد', label: 'سيد', icon: '🏷️' },
    { value: 'سيدة', label: 'سيدة', icon: '🏷️' },
    { value: 'شيخ', label: 'شيخ', icon: '🏷️' },
    { value: 'custom', label: 'مخصص', icon: '✏️' },
    { value: 'none', label: 'بدون', icon: '—' },
  ];

  const inputClass = "w-full px-4 py-3.5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-medium";

  const primaryBtnClass = "w-full py-4 rounded-2xl islamic-gradient text-primary-foreground font-bold text-sm transition-all hover:opacity-95 disabled:opacity-40 shadow-lg shadow-primary/15 active:scale-[0.98]";

  // ── Email Auth Views ──
  if (authMode === 'email-signup' || authMode === 'email-login' || authMode === 'forgot-password') {
    const titles = {
      'email-signup': { h: 'إنشاء حساب جديد', p: 'سجّل بالبريد الإلكتروني للحصول على تجربة كاملة', icon: '📧' },
      'email-login': { h: 'مرحباً بعودتك', p: 'سجّل دخولك للمتابعة', icon: '👋🏻' },
      'forgot-password': { h: 'استعادة كلمة المرور', p: 'سنرسل لك رابط إعادة التعيين', icon: '🔐' },
    };
    const t = titles[authMode];

    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-accent/8 translate-x-1/3 translate-y-1/3 blur-3xl" />

        <div className="flex-1 flex flex-col justify-center px-6 py-8 relative">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="w-full max-w-md mx-auto">
            {/* Back */}
            <motion.button
              variants={fadeIn}
              onClick={() => setAuthMode('register')}
              className="flex items-center gap-2 text-primary text-sm font-semibold mb-8 group"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
              رجوع
            </motion.button>

            {/* Header */}
            <motion.div variants={fadeIn} className="mb-8">
              <span className="text-3xl mb-3 block">{t.icon}</span>
              <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{t.h}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">{t.p}</p>
            </motion.div>

            <form
              onSubmit={authMode === 'email-signup' ? handleEmailSignup : authMode === 'email-login' ? handleEmailLogin : handleForgotPassword}
              className="space-y-4"
            >
              {authMode === 'email-signup' && (
                <motion.div variants={fadeIn}>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">الاسم</label>
                  <div className="relative">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك الكريم" className={`${inputClass} pr-11`} required />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-primary/8 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary/60" />
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div variants={fadeIn}>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" dir="ltr" className={`${inputClass} text-left pl-11`} required />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-primary/8 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                </div>
              </motion.div>

              {authMode !== 'forgot-password' && (
                <motion.div variants={fadeIn}>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="٦ أحرف على الأقل"
                      dir="ltr"
                      className={`${inputClass} text-left pl-11`}
                      required
                      minLength={6}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-primary/8 flex items-center justify-center">
                      <KeyRound className="w-3.5 h-3.5 text-primary/60" />
                    </div>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary/60 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground/40" /> : <Eye className="w-4 h-4 text-muted-foreground/40" />}
                    </button>
                  </div>
                </motion.div>
              )}

              {authMode === 'email-login' && (
                <motion.div variants={fadeIn}>
                  <button type="button" onClick={() => setAuthMode('forgot-password')} className="text-[11px] text-primary font-semibold hover:underline">
                    نسيت كلمة المرور؟
                  </button>
                </motion.div>
              )}

              <motion.div variants={fadeIn} className="pt-2">
                <button type="submit" disabled={loading} className={primaryBtnClass}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      جاري المعالجة...
                    </span>
                  ) : authMode === 'email-signup' ? 'إنشاء حساب' : authMode === 'email-login' ? 'تسجيل الدخول' : 'إرسال رابط الاستعادة'}
                </button>
              </motion.div>

              <motion.div variants={fadeIn}>
                {authMode === 'email-signup' && (
                  <p className="text-center text-xs text-muted-foreground pt-2">
                    لديك حساب؟{' '}
                    <button type="button" onClick={() => setAuthMode('email-login')} className="text-primary font-bold hover:underline">سجّل دخولك</button>
                  </p>
                )}
                {authMode === 'email-login' && (
                  <p className="text-center text-xs text-muted-foreground pt-2">
                    ليس لديك حساب؟{' '}
                    <button type="button" onClick={() => setAuthMode('email-signup')} className="text-primary font-bold hover:underline">أنشئ حساب جديد</button>
                  </p>
                )}
              </motion.div>
            </form>

            {/* Security note */}
            <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center gap-1.5 text-muted-foreground/40">
              <Shield className="w-3 h-3" />
              <span className="text-[9px] font-medium">بياناتك محمية ومشفرة بالكامل</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Main Registration View ──
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/4 -translate-y-1/3 translate-x-1/4 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-accent/6 translate-y-1/4 -translate-x-1/4 blur-3xl" />

      {/* Language selector */}
      <div className="absolute top-5 left-5 z-10">
        <select
          className="bg-card/60 backdrop-blur-xl border border-border/30 rounded-xl px-3 py-2 text-[11px] font-semibold text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          defaultValue="ar"
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8 relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo + Header */}
          <motion.div variants={fadeIn} className="text-center mb-10">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 islamic-gradient opacity-10 rounded-3xl blur-xl scale-150" />
              <img src={logoAr} alt="عِتَرَةً" className="w-20 h-auto relative object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
              {isEditing ? 'تعديل الملف الشخصي' : 'مرحباً بك في عِتَرَةً'}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isEditing ? 'عدّل معلوماتك الشخصية' : 'رفيقك الإسلامي الذكي'}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <motion.div variants={fadeIn}>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">الاسم</label>
              <div className="relative">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك الكريم" className={`${inputClass} pr-11`} required />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-primary/8 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary/60" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={fadeIn}>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">اللقب</label>
              <div className="flex flex-wrap gap-2">
                {titleOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTitle(option.value)}
                    className={`px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
                      title === option.value
                        ? 'islamic-gradient text-primary-foreground shadow-lg shadow-primary/15 scale-[1.02]'
                        : 'bg-card/80 backdrop-blur-sm border border-border/40 text-foreground hover:border-primary/30 hover:bg-card'
                    }`}
                  >
                    <span className="text-xs">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Custom title */}
            <AnimatePresence>
              {title === 'custom' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">اللقب المخصص</label>
                  <div className="relative">
                    <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="أدخل اللقب المراد" className={`${inputClass} pr-11`} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center">
                      <Tag className="w-3.5 h-3.5 text-accent-foreground/60" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div variants={fadeIn} className="pt-1">
              <button type="submit" disabled={!name.trim()} className={primaryBtnClass}>
                {isEditing ? 'حفظ التغييرات' : '✦ متابعة بدون حساب'}
              </button>
            </motion.div>

            {!isEditing && (
              <>
                {/* Divider */}
                <motion.div variants={fadeIn} className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/40" />
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="bg-background px-4 text-muted-foreground/50 font-semibold tracking-wide">أو أنشئ حساب</span>
                  </div>
                </motion.div>

                {/* Email auth */}
                <motion.div variants={fadeIn}>
                  <button
                    type="button"
                    onClick={() => setAuthMode('email-signup')}
                    className="w-full py-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 text-foreground font-bold text-sm transition-all hover:bg-card hover:border-primary/30 active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-xl bg-primary/8 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                    </div>
                    تسجيل بالبريد الإلكتروني
                  </button>
                </motion.div>

                {/* Login link */}
                <motion.div variants={fadeIn}>
                  <p className="text-center text-xs text-muted-foreground pt-1">
                    لديك حساب بالفعل؟{' '}
                    <button type="button" onClick={() => setAuthMode('email-login')} className="text-primary font-bold hover:underline">
                      سجّل دخولك
                    </button>
                  </p>
                </motion.div>
              </>
            )}

            {isEditing && (
              <motion.div variants={fadeIn}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full py-3.5 rounded-2xl bg-secondary/60 text-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors active:scale-[0.98]"
                >
                  إلغاء
                </button>
              </motion.div>
            )}
          </form>

          {/* Footer */}
          <motion.div variants={fadeIn} className="mt-10 text-center">
            <p className="text-[9px] text-muted-foreground/30 font-medium">عِتَرَةً · رفيقك الإسلامي</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Registration;
