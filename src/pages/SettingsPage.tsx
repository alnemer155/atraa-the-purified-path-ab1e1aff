import { useState } from 'react';
import { Bell, Shield, FileText, Mail, ExternalLink, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(false);

  const toggleNotifications = async () => {
    if (!notifications && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifications(perm === 'granted');
    } else {
      setNotifications(!notifications);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground mb-2">الإعدادات</h1>

      {/* Notifications */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <button
          onClick={toggleNotifications}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">الإشعارات</p>
              <p className="text-xs text-muted-foreground">تنبيهات الأذان والأذكار</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${notifications ? 'bg-primary' : 'bg-border'}`}>
            <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${notifications ? '-translate-x-5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Links */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
        <Link to="/policies" className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">سياسة الخصوصية</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <Link to="/policies" className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">شروط الاستخدام</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-gold-light rounded-2xl p-4">
        <p className="text-xs text-foreground leading-relaxed">
          ⚠️ المطور لا يتحكم في أوقات الصلاة. البيانات مقدمة من واجهة Aladhan API.
        </p>
      </div>

      {/* Developer info */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">المطوّر</h3>
        <p className="text-sm text-foreground mb-2">عبدالله بن جعفر</p>
        <div className="space-y-2">
          <a href="https://instagram.com/nr_aj5" target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-primary">
            <ExternalLink className="w-3.5 h-3.5" />
            @nr_aj5 — Instagram
          </a>
          <a href="https://x.com/nr_aj5" target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-primary">
            <ExternalLink className="w-3.5 h-3.5" />
            @nr_aj5 — X
          </a>
          <a href="mailto:a.jaafar.dev@gmail.com" className="flex items-center gap-2 text-xs text-primary">
            <Mail className="w-3.5 h-3.5" />
            a.jaafar.dev@gmail.com
          </a>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">البريد مخصص للاقتراحات والمشاكل التقنية والتصحيحات النصية فقط.</p>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        عِتْرَة — الإصدار 2.1
      </p>
    </div>
  );
};

export default SettingsPage;
