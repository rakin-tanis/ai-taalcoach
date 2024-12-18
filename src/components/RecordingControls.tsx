import React from 'react';
import { Button } from './ui/Button';
import MicrophonePermission from './MicrophonePermission';
import { CustomSpeechRecognition } from './Question';

interface RecordingControlsProps {
  isRecording: boolean;
  recognition: CustomSpeechRecognition | null;
  transcript: string;
  isLoading: boolean;
  imageLoading: boolean;
  handleStartRecording: (checkPermission: () => Promise<boolean>) => void;
  handleStopRecording: () => void;
  handleSubmit: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  recognition,
  transcript,
  isLoading,
  imageLoading,
  handleStartRecording,
  handleStopRecording,
  handleSubmit
}) => {
  return (
    <div className='flex gap-4 flex-col md:flex-row w-full justify-center max-w-[650px]'>
      <MicrophonePermission
        onPermissionGranted={() => console.log('Microphone access granted')}
        onPermissionDenied={() => console.log('Microphone access denied')}
      >
        {(checkPermission) => (
          <div className='flex gap-4 flex-col md:flex-row w-full justify-center max-w-[650px]'>
            <Button
              onClick={() =>
                isRecording
                  ? handleStopRecording()
                  : handleStartRecording(checkPermission)
              }
              disabled={!recognition || isLoading || imageLoading}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!transcript || isLoading || imageLoading}
            >
              Submit Answer
            </Button>
          </div>
        )}
      </MicrophonePermission>
    </div>
  );
};

export default RecordingControls;