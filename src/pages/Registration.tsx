import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getUser, type UserData } from '@/lib/user';
import { supabase } from '@/integrations/supabase/client';
import logoAr from '@/assets/logos/logo-ar.png';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

type AuthMode = 'register' | 'login' | 'email-signup' | 'email-login' | 'forgot-password';

const Registration = () => {
  const navigate = useNavigate();
  const existingUser = getUser();
  const [name, setName] = useState(existingUser?.name || '');
  const [title, setTitle] = useState<UserData['title']>(existingUser?.title || 'none');
  const [customTitle, setCustomTitle] = useState(existingUser?.customTitle || '');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(existingUser?.registered ? 'register' : 'register');
  const [loading, setLoading] = useState(false);

  const isEditing = !!existingUser?.registered;

  // Check for existing auth session
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
        if (!getUser()?.registered) {
          saveUser({
            name: displayName,
            title: 'none',
            email: user.email || undefined,
            registered: true,
          });
        }
        navigate('/');
      }
    });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveUser({
      name: name.trim(),
      title,
      customTitle: title === 'custom' ? customTitle.trim() : undefined,
      email: email.trim() || undefined,
      registered: true,
    });
    navigate('/');
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      saveUser({
        name: name.trim(),
        title,
        customTitle: title === 'custom' ? customTitle.trim() : undefined,
        email: email.trim(),
        registered: true,
      });
      toast.success('تم التسجيل بنجاح! تحقق من بريدك الإلكتروني');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      const user = (await supabase.auth.getUser()).data.user;
      saveUser({
        name: user?.user_metadata?.full_name || email.split('@')[0],
        title: 'none',
        email: email.trim(),
        registered: true,
      });
      toast.success('تم تسجيل الدخول');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
  };


  const titleOptions: { value: UserData['title']; label: string }[] = [
    { value: 'سيد', label: 'سيد' },
    { value: 'سيدة', label: 'سيدة' },
    { value: 'شيخ', label: 'شيخ' },
    { value: 'custom', label: 'لقب مخصص' },
    { value: 'none', label: 'بدون لقب' },
  ];

  const inputClass = "w-full px-4 py-3 rounded-xl bg-card border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm";

  // Email auth views
  if (authMode === 'email-signup' || authMode === 'email-login' || authMode === 'forgot-password') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => setAuthMode('register')}
            className="flex items-center gap-1.5 text-primary text-sm font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </button>

          <div className="text-center mb-8">
            <img src={logoAr} alt="عِتَرَةً" className="w-14 h-auto mx-auto mb-4 object-contain" />
            <h1 className="text-xl font-bold text-foreground mb-1">
              {authMode === 'email-signup' ? 'إنشاء حساب جديد' : authMode === 'email-login' ? 'تسجيل الدخول' : 'استعادة كلمة المرور'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {authMode === 'email-signup' ? 'أدخل بياناتك لإنشاء حساب' : authMode === 'email-login' ? 'أدخل بريدك وكلمة المرور' : 'أدخل بريدك لاستعادة كلمة المرور'}
            </p>
          </div>

          <form onSubmit={authMode === 'email-signup' ? handleEmailSignup : authMode === 'email-login' ? handleEmailLogin : handleForgotPassword} className="space-y-4">
            {authMode === 'email-signup' && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">الاسم</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك" className={inputClass} required />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" dir="ltr" className={`${inputClass} text-left pr-10`} required />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              </div>
            </div>

            {authMode !== 'forgot-password' && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`${inputClass} text-left pr-10`}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground/50" /> : <Eye className="w-4 h-4 text-muted-foreground/50" />}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'email-login' && (
              <button type="button" onClick={() => setAuthMode('forgot-password')} className="text-xs text-primary font-medium">
                نسيت كلمة المرور؟
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-bold text-sm transition-all hover:opacity-95 disabled:opacity-40 shadow-card active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جاري المعالجة...
                </span>
              ) : authMode === 'email-signup' ? 'إنشاء حساب' : authMode === 'email-login' ? 'تسجيل الدخول' : 'إرسال رابط الاستعادة'}
            </button>

            {authMode === 'email-signup' && (
              <p className="text-center text-xs text-muted-foreground">
                لديك حساب؟{' '}
                <button type="button" onClick={() => setAuthMode('email-login')} className="text-primary font-semibold">
                  سجّل دخولك
                </button>
              </p>
            )}
            {authMode === 'email-login' && (
              <p className="text-center text-xs text-muted-foreground">
                ليس لديك حساب؟{' '}
                <button type="button" onClick={() => setAuthMode('email-signup')} className="text-primary font-semibold">
                  أنشئ حساب
                </button>
              </p>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  // Main registration view
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5 relative">
      {/* Language selector */}
      <div className="absolute top-4 left-4 z-10">
        <select
          className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          defaultValue="ar"
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </select>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src={logoAr} alt="عِتَرَةً" className="w-16 h-auto mx-auto mb-5 object-contain" />
          <h1 className="text-xl font-bold text-foreground mb-1">
            {isEditing ? 'تعديل الملف الشخصي' : 'مرحباً بك في عِتَرَةً'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? 'عدّل معلوماتك الشخصية' : 'أدخل اسمك للمتابعة'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">الاسم</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك" className={inputClass} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">اللقب</label>
            <div className="grid grid-cols-3 gap-1.5">
              {titleOptions.slice(0, 3).map(option => (
                <button key={option.value} type="button" onClick={() => setTitle(option.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    title === option.value ? 'islamic-gradient text-primary-foreground shadow-card' : 'bg-card border border-border/60 text-foreground hover:border-primary/30'
                  }`}>{option.label}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {titleOptions.slice(3).map(option => (
                <button key={option.value} type="button" onClick={() => setTitle(option.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    title === option.value ? 'islamic-gradient text-primary-foreground shadow-card' : 'bg-card border border-border/60 text-foreground hover:border-primary/30'
                  }`}>{option.label}</button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {title === 'custom' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="block text-xs font-semibold text-foreground mb-1.5">اللقب المخصص</label>
                <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="أدخل اللقب" className={inputClass} />
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-bold text-sm transition-all hover:opacity-95 disabled:opacity-40 shadow-card active:scale-[0.98]">
            {isEditing ? 'حفظ التغييرات' : 'متابعة بدون حساب'}
          </button>

          {!isEditing && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground">أو سجّل بحسابك</span>
                </div>
              </div>

              <button type="button" onClick={() => setAuthMode('email-signup')}
                className="w-full py-3.5 rounded-xl bg-card border border-border/60 text-foreground font-bold text-sm transition-all hover:bg-secondary active:scale-[0.98] flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                تسجيل بالبريد الإلكتروني
              </button>

              <p className="text-center text-xs text-muted-foreground mt-2">
                لديك حساب بالفعل؟{' '}
                <button type="button" onClick={() => setAuthMode('email-login')} className="text-primary font-semibold">
                  سجّل دخولك
                </button>
              </p>
            </>
          )}

          {isEditing && (
            <button type="button" onClick={() => navigate(-1)}
              className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              إلغاء
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Registration;
