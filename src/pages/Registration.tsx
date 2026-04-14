import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getUser, type UserData } from '@/lib/user';
import { supabase } from '@/integrations/supabase/client';
import logoAr from '@/assets/logos/logo-ar.png';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

type AuthMode = 'register' | 'email-signup' | 'email-login' | 'forgot-password';

const fadeIn = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
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

  const titleOptions: { value: UserData['title']; label: string }[] = [
    { value: 'سيد', label: 'سيد' },
    { value: 'سيدة', label: 'سيدة' },
    { value: 'شيخ', label: 'شيخ' },
    { value: 'custom', label: 'مخصص' },
    { value: 'none', label: 'بدون' },
  ];

  const inputClass = "w-full px-4 py-3.5 rounded-2xl bg-card border border-border/30 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/15 focus:border-primary/20 transition-all text-[13px]";

  const primaryBtnClass = "w-full py-4 rounded-2xl bg-foreground text-background text-[13px] transition-all disabled:opacity-30 active:scale-[0.98]";

  if (authMode === 'email-signup' || authMode === 'email-login' || authMode === 'forgot-password') {
    const titles = {
      'email-signup': { h: 'إنشاء حساب جديد', p: 'سجّل بالبريد الإلكتروني' },
      'email-login': { h: 'مرحباً بعودتك', p: 'سجّل دخولك للمتابعة' },
      'forgot-password': { h: 'استعادة كلمة المرور', p: 'سنرسل لك رابط إعادة التعيين' },
    };
    const t = titles[authMode];

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="w-full max-w-md mx-auto">
            <motion.button
              variants={fadeIn}
              onClick={() => setAuthMode('register')}
              className="flex items-center gap-2 text-primary text-[13px] mb-8"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </motion.button>

            <motion.div variants={fadeIn} className="mb-8">
              <h1 className="text-2xl text-foreground mb-2">{t.h}</h1>
              <p className="text-muted-foreground/60 text-[13px] font-light">{t.p}</p>
            </motion.div>

            <form
              onSubmit={authMode === 'email-signup' ? handleEmailSignup : authMode === 'email-login' ? handleEmailLogin : handleForgotPassword}
              className="space-y-4"
            >
              {authMode === 'email-signup' && (
                <motion.div variants={fadeIn}>
                  <label className="block text-[10px] text-muted-foreground/50 mb-2">الاسم</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك الكريم" className={inputClass} required />
                </motion.div>
              )}

              <motion.div variants={fadeIn}>
                <label className="block text-[10px] text-muted-foreground/50 mb-2">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" dir="ltr" className={`${inputClass} text-left`} required />
              </motion.div>

              {authMode !== 'forgot-password' && (
                <motion.div variants={fadeIn}>
                  <label className="block text-[10px] text-muted-foreground/50 mb-2">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="٦ أحرف على الأقل"
                      dir="ltr"
                      className={`${inputClass} text-left`}
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 p-1">
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground/30" /> : <Eye className="w-4 h-4 text-muted-foreground/30" />}
                    </button>
                  </div>
                </motion.div>
              )}

              {authMode === 'email-login' && (
                <motion.div variants={fadeIn}>
                  <button type="button" onClick={() => setAuthMode('forgot-password')} className="text-[10px] text-primary/70">
                    نسيت كلمة المرور؟
                  </button>
                </motion.div>
              )}

              <motion.div variants={fadeIn} className="pt-2">
                <button type="submit" disabled={loading} className={primaryBtnClass}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      جاري المعالجة...
                    </span>
                  ) : authMode === 'email-signup' ? 'إنشاء حساب' : authMode === 'email-login' ? 'تسجيل الدخول' : 'إرسال رابط الاستعادة'}
                </button>
              </motion.div>

              <motion.div variants={fadeIn}>
                {authMode === 'email-signup' && (
                  <p className="text-center text-[11px] text-muted-foreground/50 pt-2">
                    لديك حساب؟{' '}
                    <button type="button" onClick={() => setAuthMode('email-login')} className="text-primary">سجّل دخولك</button>
                  </p>
                )}
                {authMode === 'email-login' && (
                  <p className="text-center text-[11px] text-muted-foreground/50 pt-2">
                    ليس لديك حساب؟{' '}
                    <button type="button" onClick={() => setAuthMode('email-signup')} className="text-primary">أنشئ حساب جديد</button>
                  </p>
                )}
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="w-full max-w-md mx-auto"
        >
          <motion.div variants={fadeIn} className="text-center mb-10">
            <img src={logoAr} alt="عِتَرَةً" className="w-18 h-auto mx-auto mb-5 object-contain" />
            <h1 className="text-2xl text-foreground mb-2">
              {isEditing ? 'تعديل الملف الشخصي' : 'مرحباً بك في عِتَرَةً'}
            </h1>
            <p className="text-muted-foreground/50 text-[13px] font-light">
              {isEditing ? 'عدّل معلوماتك الشخصية' : 'رفيقك الإسلامي الذكي'}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={fadeIn}>
              <label className="block text-[10px] text-muted-foreground/50 mb-2">الاسم</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك الكريم" className={inputClass} required />
            </motion.div>

            <motion.div variants={fadeIn}>
              <label className="block text-[10px] text-muted-foreground/50 mb-2.5">اللقب</label>
              <div className="flex flex-wrap gap-1.5">
                {titleOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTitle(option.value)}
                    className={`px-4 py-2.5 rounded-2xl text-[12px] transition-all ${
                      title === option.value
                        ? 'bg-foreground text-background'
                        : 'bg-card border border-border/30 text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <AnimatePresence>
              {title === 'custom' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="block text-[10px] text-muted-foreground/50 mb-2">اللقب المخصص</label>
                  <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="أدخل اللقب المراد" className={inputClass} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeIn} className="pt-1">
              <button type="submit" disabled={!name.trim()} className={primaryBtnClass}>
                {isEditing ? 'حفظ التغييرات' : 'متابعة بدون حساب'}
              </button>
            </motion.div>

            {!isEditing && (
              <>
                <motion.div variants={fadeIn} className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/20" />
                  </div>
                  <div className="relative flex justify-center text-[9px]">
                    <span className="bg-background px-4 text-muted-foreground/35">أو أنشئ حساب</span>
                  </div>
                </motion.div>

                <motion.div variants={fadeIn}>
                  <button
                    type="button"
                    onClick={() => setAuthMode('email-signup')}
                    className="w-full py-4 rounded-2xl bg-card border border-border/30 text-foreground text-[13px] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                  >
                    <Mail className="w-4 h-4 text-muted-foreground/50" />
                    تسجيل بالبريد الإلكتروني
                  </button>
                </motion.div>

                <motion.div variants={fadeIn}>
                  <p className="text-center text-[11px] text-muted-foreground/40 pt-1">
                    لديك حساب بالفعل؟{' '}
                    <button type="button" onClick={() => setAuthMode('email-login')} className="text-primary">
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
                  className="w-full py-3.5 rounded-2xl bg-secondary/30 text-foreground text-[13px] active:scale-[0.98] transition-transform"
                >
                  إلغاء
                </button>
              </motion.div>
            )}
          </form>

          <motion.div variants={fadeIn} className="mt-10 text-center">
            <p className="text-[8px] text-muted-foreground/25 font-light">عِتَرَةً · رفيقك الإسلامي</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Registration;
