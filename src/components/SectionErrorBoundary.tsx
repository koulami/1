import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Granular Section Error Boundary
 * Prevents minor component rendering issues from crashing the entire app (no sad face).
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`[SectionErrorBoundary:${this.props.sectionName || 'general'}] caught error:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch {}
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 text-slate-100 shadow-xl m-2 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-100">
              Προστασία Τμήματος {this.props.sectionName ? `(${this.props.sectionName})` : ''}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Ανιχνεύθηκε ένα προσωρινό σφάλμα σε αυτή την ενότητα. Τα δεδομένα, οι βαθμοί και η εξέλιξη παραμένουν ασφαλή.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Επαναφόρτωση Τμήματος</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default SectionErrorBoundary;
