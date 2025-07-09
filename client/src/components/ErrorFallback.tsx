import React from "react";
import { FallbackProps } from "react-error-boundary";
import { Button } from "@components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          {import.meta.env.DEV && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                Error details
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              onClick={resetErrorBoundary}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              Go home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
