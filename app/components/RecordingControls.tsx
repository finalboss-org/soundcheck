'use client';

interface RecordingControlsProps {
  isRecording: boolean;
  isMuted: boolean;
  onRecordingToggle: () => void;
  onMuteToggle: () => void;
}

export default function RecordingControls({ 
  isRecording, 
  isMuted, 
  onRecordingToggle, 
  onMuteToggle 
}: RecordingControlsProps) {
  return (
    <div className="flex items-center gap-x-4">
      <button
        onClick={onRecordingToggle}
        className={`rounded-md px-3 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${
          isRecording 
            ? 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600' 
            : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
        }`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      <button
        onClick={onMuteToggle}
        className={`rounded-md px-3 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${
          isMuted 
            ? 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50' 
            : 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <span className="flex items-center gap-x-2">
          {isMuted ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
          {isMuted ? 'Unmute' : 'Mute'}
        </span>
      </button>

      {isRecording && (
        <span className="inline-flex items-center gap-x-1.5 text-sm/6 text-gray-500">
          <span className="flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
          </span>
          Recording
        </span>
      )}
    </div>
  );
}