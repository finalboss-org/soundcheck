'use client';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="mb-6 flex items-center gap-x-2">
      <span className="text-sm/6 font-medium text-gray-500">Status:</span>
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        isConnected 
          ? 'bg-green-50 text-green-700 ring-green-600/20' 
          : 'bg-gray-50 text-gray-600 ring-gray-500/10'
      }`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}