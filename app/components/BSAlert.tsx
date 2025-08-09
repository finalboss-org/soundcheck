'use client';

interface BSAlertProps {
  message: string;
  onClose: () => void;
}

export default function BSAlert({ message, onClose }: BSAlertProps) {
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center px-4 py-6 z-50">
      <div className="flex w-full flex-col items-center">
        <div className="pointer-events-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 shadow-2xl ring-4 ring-white/20 backdrop-blur-xl animate-slide-in-right transform">
          <div className="relative">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

            <div className="relative p-12">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                    <svg className="h-12 w-12 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-8 flex-1">
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
                    🚨 BS Detection Alert
                  </h3>
                  <p className="text-xl text-white/90 drop-shadow mb-8 leading-relaxed font-medium">
                    {message}
                  </p>
                  <div className="flex space-x-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/40 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                    >
                      ✅ Dismiss
                    </button>
                    <button
                      type="button"
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white/90 font-semibold rounded-2xl hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/40 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                    >
                      👁️ View details
                    </button>
                  </div>
                </div>
                <div className="ml-6 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/40 rounded-2xl p-3 transition-all duration-200 transform hover:scale-110 shadow-lg"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}