import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorDisplay = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-500/30">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-6">
            We couldn't generate your hair forecast. This might be a temporary glitch or a configuration issue.
          </p>

          <div className="w-full bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-6 text-left overflow-hidden">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Error Details:</h3>
            <p className="text-red-300 text-sm font-mono break-words">
              {error?.message || "Unknown error occurred"}
            </p>
            {error?.stack && (
              <details className="mt-2 text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-300">Technical Stack Trace</summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-x-auto p-2 bg-black/30 rounded">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-full font-semibold transition-colors shadow-lg shadow-pink-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
