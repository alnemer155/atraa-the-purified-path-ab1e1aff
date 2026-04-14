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

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-secondary/25 border border-border/30 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/15 transition-all text-[13px]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-md px-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-card rounded-3xl p-5 max-w-sm w-full border border-border/20"
        onClick={e => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-6">
            <Check className="w-6 h-6 text-foreground/60 mx-auto mb-3" />
            <p className="text-[13px] text-foreground">تم بنجاح</p>
            <p className="text-[10px] text-muted-foreground/40 font-light mt-1">شكراً لتواصلك معنا</p>
          </div>
        ) : (
          <>
            <h2 className="text-[15px] text-foreground mb-1 text-center">التواصل السريع</h2>
            <p className="text-[10px] text-muted-foreground/40 font-light text-center mb-4">أرسل رسالتك وسنرد في أقرب وقت</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-muted-foreground/50 mb-1">الاسم</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="أدخل اسمك" className={inputClass} required />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground/50 mb-1.5">السبب</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {reasons.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setReason(r.value)}
                      className={`px-2.5 py-2 rounded-xl text-[10px] transition-all ${
                        reason === r.value
                          ? 'bg-foreground text-background'
                          : 'bg-secondary/25 text-muted-foreground/60'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground/50 mb-1">الرسالة</label>
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
                className="w-full py-3 rounded-xl bg-foreground text-background text-[12px] active:scale-[0.97] transition-transform disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                إرسال
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-secondary/25 text-foreground text-[12px]"
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
