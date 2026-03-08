import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, type UserData } from '@/lib/user';

const Registration = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [title, setTitle] = useState<UserData['title']>('none');
  const [customTitle, setCustomTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    saveUser({
      name: name.trim(),
      title,
      customTitle: title === 'custom' ? customTitle.trim() : undefined,
      registered: true,
    });
    navigate('/');
  };

  const titleOptions: { value: UserData['title']; label: string }[] = [
    { value: 'سيد', label: 'سيد / سيدة' },
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
          <h1 className="text-2xl font-semibold text-foreground mb-2">مرحباً بك في عِتْرَة</h1>
          <p className="text-muted-foreground text-sm">أدخل اسمك للمتابعة</p>
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
            <div className="grid grid-cols-2 gap-2">
              {titleOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTitle(option.value)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
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

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-lg islamic-gradient text-primary-foreground font-semibold text-base transition-all hover:opacity-90 disabled:opacity-50 shadow-card"
          >
            متابعة
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
