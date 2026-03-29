import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "valid" | "already_unsubscribed" | "invalid" | "success" | "error";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
        } else if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already_unsubscribed");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("error");
      }
    };

    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) {
        setStatus("error");
      } else if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already_unsubscribed");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <p className="text-muted-foreground text-lg">جارٍ التحقق...</p>
        )}

        {status === "valid" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">إلغاء الاشتراك</h1>
            <p className="text-muted-foreground">
              هل أنت متأكد من رغبتك في إلغاء اشتراكك من رسائل البريد الإلكتروني؟
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 transition-all"
            >
              {submitting ? "جارٍ المعالجة..." : "تأكيد إلغاء الاشتراك"}
            </button>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl">✅</div>
            <h1 className="text-2xl font-bold text-foreground">تم إلغاء الاشتراك</h1>
            <p className="text-muted-foreground">لن تتلقى رسائل بريد إلكتروني منا بعد الآن.</p>
          </>
        )}

        {status === "already_unsubscribed" && (
          <>
            <div className="text-5xl">📭</div>
            <h1 className="text-2xl font-bold text-foreground">تم إلغاء الاشتراك مسبقاً</h1>
            <p className="text-muted-foreground">لقد قمت بإلغاء اشتراكك بالفعل.</p>
          </>
        )}

        {status === "invalid" && (
          <>
            <div className="text-5xl">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground">رابط غير صالح</h1>
            <p className="text-muted-foreground">هذا الرابط غير صالح أو منتهي الصلاحية.</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl">❌</div>
            <h1 className="text-2xl font-bold text-foreground">حدث خطأ</h1>
            <p className="text-muted-foreground">حدث خطأ أثناء المعالجة. يرجى المحاولة مرة أخرى لاحقاً.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
