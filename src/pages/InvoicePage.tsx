import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Printer, ArrowLeft, Check, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Invoice = {
  id: string;
  invoice_number: string;
  customer_email: string | null;
  customer_name: string | null;
  amount_cents: number;
  currency: string;
  display_amount_sar: number | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  price_id: string;
  environment: string;
};

const InvoicePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data, error: err } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (err || !data) {
        setError(isAr ? 'لم يتم العثور على الفاتورة' : 'Invoice not found');
      } else {
        setInvoice(data as Invoice);
      }
      setLoading(false);
    };
    load();
  }, [id, isAr]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    // Trigger print dialog → user can save as PDF
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" strokeWidth={1.5} />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 bg-background ${isAr ? 'text-right' : 'text-left'}`}>
        <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" strokeWidth={1.5} />
        <p className="text-[13px] text-foreground font-medium mb-1">
          {error}
        </p>
        <p className="text-[11px] text-muted-foreground/60 font-light mb-5">
          {isAr ? 'تأكد من صحة الرابط' : 'Please check the link'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-xl bg-foreground text-background text-[12px] active:scale-95 transition-transform"
        >
          {isAr ? 'العودة للرئيسية' : 'Back home'}
        </button>
      </div>
    );
  }

  const date = invoice.paid_at || invoice.created_at;
  const amountUsd = (invoice.amount_cents / 100).toFixed(2);

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; padding: 32px !important; }
          @page { margin: 16mm; }
        }
      `}</style>

      <div className={`min-h-screen bg-background py-6 px-4 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        {/* Top bar — hidden on print */}
        <div className="no-print max-w-2xl mx-auto mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/40 text-foreground text-[11px] active:scale-95 transition-transform"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
              {isAr ? 'طباعة' : 'Print'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] active:scale-95 transition-transform"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              PDF
            </button>
          </div>
        </div>

        {/* Invoice card */}
        <div className="print-area max-w-2xl mx-auto bg-card border border-border/30 rounded-2xl shadow-card overflow-hidden">
          {/* Letterhead */}
          <div className="px-8 py-6 border-b border-border/20 flex items-start justify-between">
            <div>
              <h1 className="text-[20px] text-foreground tracking-tight font-medium">
                {isAr ? 'عِتَرَةً' : 'Atraa'}
              </h1>
              <p className="text-[10px] text-muted-foreground/60 font-light mt-0.5">
                atraa.xyz · support@atraa.xyz
              </p>
            </div>
            <div className={isAr ? 'text-left' : 'text-right'}>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-light">
                {isAr ? 'فاتورة' : 'Invoice'}
              </p>
              <p className="text-[14px] text-foreground tabular-nums mt-0.5 font-medium">
                {invoice.invoice_number}
              </p>
              {invoice.environment === 'sandbox' && (
                <span className="inline-block mt-1.5 text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-light">
                  {isAr ? 'تجريبي' : 'TEST'}
                </span>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className="px-8 py-3 bg-secondary/15 border-b border-border/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" strokeWidth={2.5} />
              </div>
              <span className="text-[12px] text-foreground font-medium">
                {isAr ? 'مدفوعة' : 'Paid'}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground/60 font-light tabular-nums">
              {new Date(date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Bill to */}
          <div className="px-8 py-5 grid grid-cols-2 gap-6 border-b border-border/15">
            <div>
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-light mb-1.5">
                {isAr ? 'الفاتورة من' : 'Billed from'}
              </p>
              <p className="text-[12px] text-foreground font-medium">
                {isAr ? 'منصة عِتَرَةً' : 'Atraa Platform'}
              </p>
              <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5">
                {isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-light mb-1.5">
                {isAr ? 'الفاتورة إلى' : 'Billed to'}
              </p>
              <p className="text-[12px] text-foreground font-medium">
                {invoice.customer_name || (isAr ? 'داعم كريم' : 'Generous supporter')}
              </p>
              {invoice.customer_email && (
                <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5">
                  {invoice.customer_email}
                </p>
              )}
            </div>
          </div>

          {/* Line item */}
          <div className="px-8 py-5">
            <div className="grid grid-cols-12 gap-4 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-light pb-2 border-b border-border/15">
              <div className="col-span-7">{isAr ? 'البند' : 'Description'}</div>
              <div className="col-span-2 text-center">{isAr ? 'الكمية' : 'Qty'}</div>
              <div className={`col-span-3 ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'المبلغ' : 'Amount'}</div>
            </div>

            <div className="grid grid-cols-12 gap-4 py-4 items-start">
              <div className="col-span-7">
                <p className="text-[12px] text-foreground">
                  {isAr ? 'دعم رقمي طوعي' : 'Voluntary Digital Sponsorship'}
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-light mt-0.5">
                  {isAr
                    ? 'مساهمة في تطوير وصيانة منصة عِتَرَةً'
                    : 'Contribution to the development of Atraa platform'}
                </p>
              </div>
              <div className="col-span-2 text-center text-[12px] text-foreground tabular-nums">1</div>
              <div className={`col-span-3 text-[12px] text-foreground tabular-nums ${isAr ? 'text-left' : 'text-right'}`}>
                {invoice.display_amount_sar
                  ? `${invoice.display_amount_sar} SAR`
                  : `$${amountUsd}`}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border/15 pt-4 space-y-1.5">
              {invoice.display_amount_sar && (
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-light">
                  <span>{isAr ? 'ما يعادل' : 'Equivalent'}</span>
                  <span className="tabular-nums">${amountUsd} {invoice.currency}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border/15">
                <span className="text-[13px] text-foreground font-medium">
                  {isAr ? 'الإجمالي' : 'Total'}
                </span>
                <span className="text-[18px] text-foreground tabular-nums font-medium">
                  {invoice.display_amount_sar ? (
                    <>
                      {invoice.display_amount_sar}
                      <span className="text-[11px] text-muted-foreground/60 ms-1 font-light">SAR</span>
                    </>
                  ) : (
                    <>
                      ${amountUsd}
                      <span className="text-[11px] text-muted-foreground/60 ms-1 font-light">{invoice.currency}</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-secondary/10 border-t border-border/15 text-center">
            <p className="text-[11px] text-foreground font-medium mb-1">
              {isAr ? 'جزاكم الله خيراً' : 'May Allah reward you'}
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-light leading-relaxed">
              {isAr
                ? 'تم استلام مساهمتك بنجاح. هذه الفاتورة دليل على إتمام العملية.'
                : 'Your contribution was received. This invoice confirms the transaction.'}
            </p>
            <p className="text-[9px] text-muted-foreground/40 font-light mt-3 tabular-nums">
              {isAr ? 'تم الإصدار عبر Paddle · معرّف' : 'Issued via Paddle · ID'} {invoice.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePage;
