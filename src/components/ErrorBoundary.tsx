import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

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

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-base font-bold text-foreground mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-xs text-muted-foreground mb-5 max-w-[260px] leading-relaxed">
            نعتذر عن هذا الخطأ. يرجى تحديث الصفحة والمحاولة مرة أخرى.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl islamic-gradient text-primary-foreground text-sm font-bold shadow-lg shadow-primary/15 active:scale-[0.97] transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة تحميل
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
