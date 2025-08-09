'use client';

interface PermissionErrorProps {
  browser: 'chrome' | 'firefox' | 'safari' | 'other';
  onRetry: () => void;
}

export default function PermissionError({ browser, onRetry }: PermissionErrorProps) {
  const getInstructions = () => {
    switch (browser) {
      case 'chrome':
        return (
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click the camera icon in the address bar</li>
            <li>Select &quot;Allow&quot; for microphone access</li>
            <li>Reload the page</li>
          </ol>
        );
      case 'firefox':
        return (
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click the microphone icon in the address bar</li>
            <li>Remove the blocked permission</li>
            <li>Reload and allow microphone access</li>
          </ol>
        );
      case 'safari':
        return (
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to Safari {">"} Settings for This Website</li>
            <li>Change Microphone to &quot;Allow&quot;</li>
            <li>Reload the page</li>
          </ol>
        );
      default:
        return (
          <p className="text-sm">
            Please allow microphone access in your browser settings and reload the page.
          </p>
        );
    }
  };

  return (
    <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Microphone access required</h3>
          <div className="mt-2 text-sm text-yellow-700">
            {getInstructions()}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}