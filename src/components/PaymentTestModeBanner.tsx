import { useTranslation } from "react-i18next";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  if (!clientToken?.startsWith("test_")) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-[10px] text-amber-600 dark:text-amber-400 font-light">
      {isAr ? "وضع التجربة — لن يتم خصم أي مبلغ حقيقي" : "Test mode — no real money will be charged"}
    </div>
  );
}
