import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-[#F2F2F7] max-w-sm w-full flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1C1C1E]">
              {this.props.fallbackTitle || 'Unable to display view'}
            </h3>
            <p className="text-xs text-[#8E8E93] max-w-xs font-mono bg-[#F2F2F7] p-2 rounded-lg break-all">
              {this.state.error?.message || 'A data error occurred.'}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-xl shadow-xs transition cursor-pointer min-h-[36px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Dismiss & Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children || null;
  }
}
