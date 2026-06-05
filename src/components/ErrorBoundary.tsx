import { Component, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { logError } from '@/lib/error-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('ErrorBoundary caught:', error);
    try {
      logError(error.message, {
        stack: error.stack,
        context: { component_stack: info?.componentStack ?? null, source: 'ErrorBoundary' },
      });
    } catch { /* ignore */ }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center" dir="rtl">
          <div className="w-14 h-14 rounded-full bg-secondary/40 flex items-center justify-center mb-5">
            <AlertTriangle className="w-5 h-5 text-muted-foreground" strokeWidth={1.4} />
          </div>
          <h2 className="text-[15px] text-foreground font-light mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-[12px] text-muted-foreground font-light mb-6 max-w-[280px] leading-relaxed">
            نعتذر عن هذا الخطأ. تم تسجيله تلقائياً وسيتم مراجعته، يرجى تحديث الصفحة.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground text-[12px] active:scale-[0.98] transition-transform"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.6} />
            إعادة تحميل
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
