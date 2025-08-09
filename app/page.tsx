'use client';

import { useState } from 'react';
import BSAlert from './components/BSAlert';
import AudioVisualizer from './components/AudioVisualizer';
import ConnectionStatus from './components/ConnectionStatus';
import RecordingControls from './components/RecordingControls';
import PermissionError from './components/PermissionError';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [bsAlert, setBsAlert] = useState<{ message: string } | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | undefined>();

  // Josh will wire these up to VAPI
  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    // Josh: Connect to VAPI start/stop recording
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // Josh: Connect to VAPI mute/unmute
  };

  const handlePermissionRetry = () => {
    setPermissionError(false);
    // Josh: Retry microphone permission request
  };

  const handleClearTranscription = () => {
    setTranscription('');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-base/7 font-semibold text-gray-900">Soundcheck</h1>
            </div>
            <div className="flex items-center gap-x-4">
              <span className="text-sm/6 text-gray-500">Real-time BS Detection</span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            
            {/* Stats Section */}
            <div className="border-b border-b-gray-900/10">
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8 sm:border-l-0 lg:border-l">
                  <dt className="text-sm/6 font-medium text-gray-500">Session Status</dt>
                  <dd className="w-full flex-none">
                    <ConnectionStatus isConnected={isConnected} />
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8 sm:border-l">
                  <dt className="text-sm/6 font-medium text-gray-500">Recording</dt>
                  <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                    {isRecording ? 'Active' : 'Inactive'}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8 lg:border-l">
                  <dt className="text-sm/6 font-medium text-gray-500">Detections</dt>
                  <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">0</dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8 sm:border-l">
                  <dt className="text-sm/6 font-medium text-gray-500">Confidence</dt>
                  <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">--</dd>
                </div>
              </dl>
            </div>

            {permissionError && (
              <div className="mt-6">
                <PermissionError 
                  browser="chrome" 
                  onRetry={handlePermissionRetry}
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className="space-y-16 py-16 xl:space-y-20">
              {/* Audio Visualizer Section */}
              <div>
                <h2 className="text-base/7 font-semibold text-gray-900 mb-6">Audio Analysis</h2>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <AudioVisualizer audioData={audioData} />
                </div>
              </div>

              {/* Recording Controls */}
              <div>
                <h2 className="text-base/7 font-semibold text-gray-900 mb-6">Controls</h2>
                <RecordingControls
                  isRecording={isRecording}
                  isMuted={isMuted}
                  onRecordingToggle={handleRecordingToggle}
                  onMuteToggle={handleMuteToggle}
                />
              </div>

              {/* Transcription Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base/7 font-semibold text-gray-900">Live Transcription</h2>
                  {transcription && (
                    <button 
                      onClick={handleClearTranscription}
                      className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Clear<span className="sr-only"> transcription</span>
                    </button>
                  )}
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6 min-h-[300px]">
                  {transcription ? (
                    <div className="text-sm/6 text-gray-900">
                      {transcription}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[250px]">
                      <p className="text-sm/6 text-gray-500">
                        Transcription will appear here when recording starts...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BS Alert (would appear when BS is detected) */}
      {bsAlert && (
        <BSAlert
          message={bsAlert.message}
          onClose={() => setBsAlert(null)}
        />
      )}
    </div>
  );
}
