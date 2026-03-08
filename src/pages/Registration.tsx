import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getUser, type UserData } from '@/lib/user';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl islamic-gradient flex items-center justify-center shadow-elevated">
            <span className="text-3xl font-bold text-primary-foreground">ع</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {isEditing ? 'تعديل الملف الشخصي' : 'مرحباً بك في عِتْرَة'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? 'عدّل معلوماتك الشخصية' : 'أدخل اسمك للمتابعة'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">اللقب</label>
            <div className="grid grid-cols-3 gap-2">
              {titleOptions.slice(0, 3).map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTitle(option.value)}
                  className={`px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    title === option.value
                      ? 'bg-primary text-primary-foreground shadow-card'
                      : 'bg-card border border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {titleOptions.slice(3).map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTitle(option.value)}
                  className={`px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    title === option.value
                      ? 'bg-primary text-primary-foreground shadow-card'
                      : 'bg-card border border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {title === 'custom' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-foreground mb-2">اللقب المخصص</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="أدخل اللقب"
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              البريد الإلكتروني <span className="text-muted-foreground text-xs">(اختياري)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              dir="ltr"
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-left"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-lg islamic-gradient text-primary-foreground font-semibold text-base transition-all hover:opacity-90 disabled:opacity-50 shadow-card"
          >
            {isEditing ? 'حفظ التغييرات' : 'متابعة'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-3 rounded-lg bg-secondary text-foreground text-sm font-medium"
            >
              إلغاء
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Registration;
