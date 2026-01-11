
import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in their child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Explicitly declare props and state to ensure they are correctly typed and recognized by the compiler,
  // resolving the error "Property 'props' does not exist on type 'ErrorBoundary'".
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    // Explicitly assigning props and initializing state to satisfy TypeScript property existence checks.
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Access 'hasError' through 'this.state' which is now explicitly defined.
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50 p-4 text-center" dir="rtl">
          <div className="max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">عذراً، حدث خطأ غير متوقع.</h1>
            <p className="text-gray-600 mb-6">
              واجه التطبيق مشكلة تقنية. يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.
            </p>
            <div className="bg-gray-100 p-3 rounded text-left text-xs overflow-auto max-h-32 mb-6">
                <code>{this.state.error?.toString()}</code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    // Access 'children' from 'this.props', which is explicitly defined and assigned in the constructor.
    return this.props.children;
  }
}

export default ErrorBoundary;
