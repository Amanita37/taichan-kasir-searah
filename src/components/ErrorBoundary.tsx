
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription className="mt-2">
              <p>Maaf, terjadi kesalahan yang tidak diharapkan.</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Coba Lagi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
