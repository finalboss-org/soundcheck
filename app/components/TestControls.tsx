'use client';

interface TestControlsProps {
  onTriggerBS: (confidence: number, message: string) => void;
  onSimulateTranscription: (text: string) => void;
  onToggleRecording: () => void;
  isRecording: boolean;
}

export default function TestControls({ 
  onTriggerBS, 
  onSimulateTranscription, 
  onToggleRecording,
  isRecording 
}: TestControlsProps) {
  const testScenarios = [
    { confidence: 0.95, message: "The Earth is flat", truth: "The Earth is an oblate spheroid" },
    { confidence: 0.85, message: "We only use 10% of our brain", truth: "We use virtually all of our brain" },
    { confidence: 0.75, message: "Lightning never strikes twice", truth: "Lightning can strike the same place multiple times" },
    { confidence: 0.45, message: "Organic food is pesticide-free", truth: "Organic farming uses natural pesticides" },
    { confidence: 0.25, message: "Glass is a liquid", truth: "Glass is an amorphous solid" },
  ];

  const transcriptionSamples = [
    "So as I was saying, the new quarterly projections show a 200% growth...",
    "We've secured partnerships with all major Fortune 500 companies...",
    "Our AI model has achieved 99.9% accuracy in all benchmarks...",
    "The clinical trials showed zero side effects across all participants...",
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <h3 className="text-base/7 font-semibold text-gray-900 mb-4">Test Controls</h3>
      
      {/* Recording Simulation */}
      <div className="mb-6">
        <h4 className="text-sm/6 font-medium text-gray-700 mb-2">Recording Simulation</h4>
        <button
          onClick={onToggleRecording}
          className={`px-4 py-2 rounded-md font-medium text-sm/6 transition-colors ${
            isRecording 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isRecording ? 'Stop Mock Recording' : 'Start Mock Recording'}
        </button>
      </div>

      {/* BS Detection Scenarios */}
      <div className="mb-6">
        <h4 className="text-sm/6 font-medium text-gray-700 mb-2">Trigger BS Detection</h4>
        <div className="space-y-2">
          {testScenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => onTriggerBS(scenario.confidence, scenario.message)}
              className="w-full text-left px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm/6 text-gray-900">{scenario.message}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  scenario.confidence > 0.8 ? 'bg-red-100 text-red-700' :
                  scenario.confidence > 0.5 ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {(scenario.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transcription Simulation */}
      <div>
        <h4 className="text-sm/6 font-medium text-gray-700 mb-2">Simulate Transcription</h4>
        <div className="space-y-2">
          {transcriptionSamples.map((sample, index) => (
            <button
              key={index}
              onClick={() => onSimulateTranscription(sample)}
              className="w-full text-left px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm/6 text-gray-700"
            >
              {sample.substring(0, 50)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}