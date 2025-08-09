'use client';

import { useState, useEffect } from 'react';
import BSAlert from './components/BSAlert';
import AudioVisualizer from './components/AudioVisualizer';
import ConnectionStatus from './components/ConnectionStatus';
import RecordingControls from './components/RecordingControls';
import PermissionError from './components/PermissionError';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [bsAlert, setBsAlert] = useState<{ message: string } | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | undefined>();

  // WebSocket connection
  const { isConnected, lastMessage, sendMessage } = useWebSocket();

  // Initialize WebSocket server when component mounts
  useEffect(() => {
    const initWebSocketServer = async () => {
      try {
        await fetch('/api/websocket/init', { method: 'POST' });
        console.log('WebSocket server initialized');
      } catch (error) {
        console.error('Failed to initialize WebSocket server:', error);
      }
    };

    initWebSocketServer();
  }, []);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('Processing WebSocket message:', lastMessage);

      // Handle different message types
      switch (lastMessage.type) {
        case 'chat_completion_triggered':
          // Display the bullshit detection results when chat completion is triggered
          const bsData = lastMessage.bullshitDetection;
          if (bsData && bsData.length > 0) {
            const result = bsData[0];
            const transcriptionText = `
=== BULLSHIT DETECTION RESULTS ===
User Message: ${lastMessage.userMessage || 'Unknown'}
Truth: ${result.truth || 'No truth provided'}
Confidence: ${result.confidence || 'Unknown'}
Reasoning: ${result.reasoning || 'No reasoning provided'}
====================================

`;
            setTranscription(prev => prev + transcriptionText);
          } else {
            setTranscription(prev => prev + `[WebSocket] ${lastMessage.message}\n`);
          }
          break;
        case 'connected':
          console.log('WebSocket connection established');
          break;
        case 'echo':
          console.log('Echo received:', lastMessage.message);
          break;
        default:
          console.log('Unknown message type:', lastMessage.type);
      }
    }
  }, [lastMessage]);

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

  // Test function to trigger chat completions (which should send WebSocket message)
  const testChatCompletions = async () => {
    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Test message to trigger WebSocket' }
          ]
        }),
      });

      if (response.ok) {
        console.log('Chat completions request sent successfully');
      }
    } catch (error) {
      console.error('Error testing chat completions:', error);
    }
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

                {/* WebSocket Test Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={testChatCompletions}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Test WebSocket (Trigger Chat Completion)
                  </button>
                  <p className="mt-2 text-sm text-gray-500">
                    WebSocket Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                  </p>
                </div>
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
