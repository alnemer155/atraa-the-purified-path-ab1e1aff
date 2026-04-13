import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const reasons = [
  { value: 'complaint', label: 'شكوى' },
  { value: 'inquiry', label: 'استفسار' },
  { value: 'feature', label: 'طلب إضافة' },
];

interface ContactFormProps {
  onClose: () => void;
}

const ContactForm = ({ onClose }: ContactFormProps) => {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reason || !message.trim()) return;

    setSending(true);

    const subject = encodeURIComponent(`[عِتَرَةً] ${reasons.find(r => r.value === reason)?.label} - ${name}`);
    const body = encodeURIComponent(`الاسم: ${name}\nالسبب: ${reasons.find(r => r.value === reason)?.label}\n\n${message}`);
    
    window.open(`https://mail.google.com/mail/?view=cm&to=a.jaafar.dev@gmail.com&su=${subject}&body=${body}`, '_blank');
    
    setSending(false);
    setSent(true);
    toast.success('تم فتح البريد الإلكتروني');
    setTimeout(() => onClose(), 1500);
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-secondary/40 border border-border/40 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm px-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-3xl p-5 max-w-sm w-full border border-border/30"
        onClick={e => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-6">
            <Check className="w-7 h-7 text-primary mx-auto mb-3" />
            <p className="text-sm text-foreground">تم بنجاح!</p>
            <p className="text-[11px] text-muted-foreground font-light mt-1">شكراً لتواصلك معنا</p>
          </div>
        ) : (
          <>
            <h2 className="text-base text-foreground mb-1 text-center">التواصل السريع</h2>
            <p className="text-[11px] text-muted-foreground font-light text-center mb-4">أرسل رسالتك وسنرد في أقرب وقت</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-foreground mb-1">الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-foreground mb-1.5">السبب</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {reasons.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setReason(r.value)}
                      className={`px-2.5 py-2 rounded-xl text-[11px] transition-all ${
                        reason === r.value
                          ? 'islamic-gradient text-primary-foreground'
                          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/70'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-foreground mb-1">الرسالة</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending || !name.trim() || !reason || !message.trim()}
                className="w-full py-3 rounded-xl islamic-gradient text-primary-foreground text-sm active:scale-[0.97] transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                إرسال
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-secondary/60 text-foreground text-sm"
              >
                إلغاء
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ContactForm;
