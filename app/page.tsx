'use client';

import { useState, useEffect } from 'react';
import BSAlert from './components/BSAlert';
import AudioVisualizer from './components/AudioVisualizer';
import ConnectionStatus from './components/ConnectionStatus';
import RecordingControls from './components/RecordingControls';
import PermissionError from './components/PermissionError';
import TestControls from './components/TestControls';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [bsAlert, setBsAlert] = useState<{ message: string } | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [audioData] = useState<Uint8Array | undefined>();
  const [detectionCount, setDetectionCount] = useState(0);
  const [lastConfidence, setLastConfidence] = useState<string>('--');

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket();

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

                        // Parse bullshitLevel and confidence as numbers (both use 0-5 scale)
            const bullshitLevel = result.bullshitLevel ? parseFloat(result.bullshitLevel.toString()) : 0;
            const confidenceNum = result.confidence ? parseFloat(result.confidence.toString()) : 0;
            const isValidBullshitLevel = !isNaN(bullshitLevel);
            const isValidConfidence = !isNaN(confidenceNum);

            // Update confidence display (convert to 0-5 scale display)
            setLastConfidence(isValidConfidence ? confidenceNum.toFixed(1) : '--');

            // Check for BS detection using proper 0-5 scales:
            // - bullshitLevel > 3 indicates significant BS (60%+ on 0-5 scale)
            // - confidence > 2.5 indicates reasonable confidence in the assessment
            const bsDetected = isValidBullshitLevel && bullshitLevel > 3 &&
                             isValidConfidence && confidenceNum > 2.5;

            if (bsDetected) {
              // Update detection count only when BS is actually detected
              setDetectionCount(prev => prev + 1);

              // Show BS alert
              setBsAlert({ message: `Potential BS detected: ${result.truth || 'Truth unknown'}` });
              // Auto-dismiss after 5 seconds
              setTimeout(() => setBsAlert(null), 5000);

              // Add detailed transcription for BS detections
              const transcriptionText = `
=== BULLSHIT DETECTION RESULTS ===
User Message: ${lastMessage.userMessage || 'Unknown'}
Truth: ${result.truth || 'No truth provided'}
Bullshit Level: ${bullshitLevel.toFixed(1)}/5 (${(bullshitLevel/5*100).toFixed(0)}%)
Confidence: ${confidenceNum.toFixed(1)}/5 (${(confidenceNum/5*100).toFixed(0)}%)
Reasoning: ${result.reasoning || 'No reasoning provided'}
====================================

`;
              setTranscription(prev => prev + transcriptionText);
            } else {
              // Just log the check without incrementing count or showing popup
              const transcriptionText = `
=== BS CHECK COMPLETED ===
User Message: ${lastMessage.userMessage || 'Unknown'}
Bullshit Level: ${isValidBullshitLevel ? bullshitLevel.toFixed(1) : 'Unknown'}/5
Confidence: ${isValidConfidence ? confidenceNum.toFixed(1) : 'Unknown'}/5
Result: No significant BS detected (level=${bullshitLevel.toFixed(1)}, confidence=${confidenceNum.toFixed(1)})
====================================

`;
              setTranscription(prev => prev + transcriptionText);
            }
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
            { role: 'user', content: '2 plus 2 equals five' }
          ]
        }),
      });

      if (response.ok) {
        console.log('Chat completions request sent successfully');
        // Add a sample detection to test the UI
        setTimeout(() => {
          setTranscription(prev => prev + '\n[Testing UI] Waiting for WebSocket response...\n');
        }, 500);
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
              <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">Test Mode</span>
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
                  <dd className={`w-full flex-none text-3xl/10 font-medium tracking-tight ${detectionCount > 0 ? 'text-orange-600' : 'text-gray-900'} transition-all duration-300`}>{detectionCount}</dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8 sm:border-l">
                  <dt className="text-sm/6 font-medium text-gray-500">Confidence</dt>
                  <dd className={`w-full flex-none text-3xl/10 font-medium tracking-tight transition-all duration-300 ${
                    lastConfidence === '--' ? 'text-gray-900' :
                    parseFloat(lastConfidence) > 0.8 ? 'text-red-600' :
                    parseFloat(lastConfidence) > 0.5 ? 'text-orange-600' :
                    'text-green-600'
                  }`}>{lastConfidence}</dd>
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
                  <AudioVisualizer audioData={audioData} isRecording={isRecording} />
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

              {/* Test Controls - Remove this section when VAPI is integrated */}
              <div>
                <h2 className="text-base/7 font-semibold text-gray-900 mb-6">Development Testing</h2>
                <TestControls
                  isRecording={isRecording}
                  onToggleRecording={handleRecordingToggle}
                                    onTriggerBS={(confidence, message) => {
                    // Simulate BS detection using 0-5 scale
                    const bullshitLevel = confidence; // Use the same value for testing
                    const mockResult = {
                      bullshitLevel: bullshitLevel,
                      confidence: confidence,
                      truth: 'This is the actual truth',
                      reasoning: 'Analysis shows this statement is false',
                    };

                    // Update confidence display
                    setLastConfidence(confidence.toFixed(1));

                    // Use same logic as WebSocket handler: bullshitLevel > 3 && confidence > 2.5
                    const shouldTriggerAlert = bullshitLevel > 3 && confidence > 2.5;

                    if (shouldTriggerAlert) {
                      // Only increment counter when BS is actually detected
                      setDetectionCount(prev => prev + 1);
                      setBsAlert({ message: `BS Detected: "${message}"` });
                      setTimeout(() => setBsAlert(null), 5000);
                    }

                    // Add to transcription with proper formatting
                    const transcriptionText = `
=== ${shouldTriggerAlert ? 'BULLSHIT DETECTION RESULTS' : 'BS CHECK COMPLETED'} ===
User Message: ${message}
Truth: ${mockResult.truth}
Bullshit Level: ${bullshitLevel.toFixed(1)}/5 (${(bullshitLevel/5*100).toFixed(0)}%)
Confidence: ${confidence.toFixed(1)}/5 (${(confidence/5*100).toFixed(0)}%)
Reasoning: ${mockResult.reasoning}
Result: ${shouldTriggerAlert ? 'BS detected' : 'No significant BS detected'}
====================================

`;
                    setTranscription(prev => prev + transcriptionText);
                  }}
                  onSimulateTranscription={(text) => {
                    // Simulate streaming transcription
                    let index = 0;
                    const interval = setInterval(() => {
                      if (index < text.length) {
                        setTranscription(prev => prev + text[index]);
                        index++;
                      } else {
                        clearInterval(interval);
                        setTranscription(prev => prev + '\n');
                      }
                    }, 30); // Simulate typing speed
                  }}
                />
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
