import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getUser, type UserData } from '@/lib/user';
import { lovable } from '@/integrations/lovable/index';
import logoAr from '@/assets/logos/logo-ar.png';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Registration = () => {
  const navigate = useNavigate();
  const existingUser = getUser();
  const [name, setName] = useState(existingUser?.name || '');
  const [title, setTitle] = useState<UserData['title']>(existingUser?.title || 'none');
  const [customTitle, setCustomTitle] = useState(existingUser?.customTitle || '');
  const [email, setEmail] = useState(existingUser?.email || '');

  const isEditing = !!existingUser?.registered;

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

  const titleOptions: { value: UserData['title']; label: string }[] = [
    { value: 'سيد', label: 'سيد' },
    { value: 'سيدة', label: 'سيدة' },
    { value: 'شيخ', label: 'شيخ' },
    { value: 'custom', label: 'لقب مخصص' },
    { value: 'none', label: 'بدون لقب' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
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
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">اللقب</label>
            <div className="grid grid-cols-3 gap-1.5">
              {titleOptions.slice(0, 3).map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTitle(option.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    title === option.value
                      ? 'islamic-gradient text-primary-foreground shadow-card'
                      : 'bg-card border border-border/60 text-foreground hover:border-primary/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {titleOptions.slice(3).map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTitle(option.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    title === option.value
                      ? 'islamic-gradient text-primary-foreground shadow-card'
                      : 'bg-card border border-border/60 text-foreground hover:border-primary/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {title === 'custom' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-xs font-semibold text-foreground mb-1.5">اللقب المخصص</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="أدخل اللقب"
                className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm"
              />
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              البريد الإلكتروني <span className="text-muted-foreground font-normal">(اختياري)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-left"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl islamic-gradient text-primary-foreground font-bold text-sm transition-all hover:opacity-95 disabled:opacity-40 shadow-card active:scale-[0.98]"
          >
            {isEditing ? 'حفظ التغييرات' : 'متابعة'}
          </button>

          {!isEditing && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground">أو</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth('apple', {
                    redirect_uri: window.location.origin,
                  });
                  if (error) {
                    toast.error('فشل تسجيل الدخول بـ Apple');
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                تسجيل الدخول بـ Apple
              </button>
            </>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              إلغاء
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Registration;
