import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/Button';
import MicrophonePermission from './MicrophonePermission';

// Utility to detect mobile devices
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
// Extend Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition?: {
      new(): CustomSpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new(): CustomSpeechRecognition;
    };
  }
}

// Custom type for Speech Recognition
interface CustomSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Custom event type for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  error?: string;
}

// Type guard for speech recognition
function isSpeechRecognitionConstructor(obj: unknown): obj is { new(): CustomSpeechRecognition } {
  return typeof obj === 'function';
}

interface RecordingControlsProps {
  isLoading: boolean;
  imageLoading: boolean;
  onTranscriptChange: (transcript: string) => void;
  onRecordingPause: () => void;
  onSubmit: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isLoading,
  imageLoading,
  onTranscriptChange,
  onRecordingPause,
  onSubmit
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<CustomSpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);


  // Refs for touch/mouse events
  const isPressingRef = useRef(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Determine device type
  const isMobile = isMobileDevice();

  // Setup Speech Recognition
  useEffect(() => {
    const setupSpeechRecognition = (): CustomSpeechRecognition | null => {
      // Check for speech recognition support
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition || !isSpeechRecognitionConstructor(SpeechRecognition)) {
        setError('Speech recognition is not supported on this device');
        return null;
      }

      try {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = isMobile;  // Continuous for mobile
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'nl-NL';

        // Error Handling
        recognitionInstance.onerror = (event: SpeechRecognitionEvent) => {
          const errorMessages: Record<string, string> = {
            'no-speech': 'No speech was detected. Please speak into the microphone.',
            'audio-capture': 'No microphone was found. Ensure microphone is connected.',
            'not-allowed': 'Permission to use microphone was denied. Please check browser settings.',
            'network': 'Network error occurred during speech recognition.',
          };

          const errorKey = event.error || 'default';
          setError(errorMessages[errorKey] || 'An unknown error occurred during speech recognition.');
          setIsRecording(false);
        };

        // Event Handlers
        recognitionInstance.onstart = () => {
          setIsRecording(true);
          setError(null);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
          onRecordingPause();

          // For mobile, restart if still pressing
          if (isMobile && isPressingRef.current) {
            recognitionInstance.start();
          }
        };

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          if (isMobile) {
            const results = event.results;
            let finalTranscript = '';

            // Collect all final results
            for (let i = 0; i < results.length; i++) {
              const result = results[i];

              if (result.isFinal) {
                const transcript = result[0].transcript.trim();

                // Avoid duplicate or fragmented entries
                if (transcript && !finalTranscript.includes(transcript)) {
                  finalTranscript += (finalTranscript ? ' ' : '') + transcript;
                }
              }
            }

            // Clean and deduplicate
            const cleanedTranscript = finalTranscript
              .split(' ')
              .filter((word, index, self) =>
                self.indexOf(word) === index && word.length > 0
              )
              .join(' ')
              .trim();

            if (cleanedTranscript) {
              setTranscript(cleanedTranscript);
              onTranscriptChange(cleanedTranscript);
            }
          } else {
            // Existing desktop logic
            const results = event.results;
            const currentTranscript = Array.from(results)
              .map(result => result[0].transcript)
              .join('');

            setTranscript(currentTranscript);
            onTranscriptChange(currentTranscript);
          }
        };

        return recognitionInstance;
      } catch (setupError) {
        console.error('Error setting up speech recognition', setupError);
        setError('Could not set up speech recognition');
        return null;
      }
    };

    const recognitionInstance = setupSpeechRecognition();
    setRecognition(recognitionInstance);

    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onTranscriptChange, isMobile]);

  // Start Recording Handler
  const startRecording = useCallback(async (checkPermission: () => Promise<boolean>) => {
    setError(null);

    if (!recognition) {
      setError('Speech recognition is not supported');
      return false;
    }

    try {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        setError('Microphone access is required');
        return false;
      }

      recognition.start();
      return true;
    } catch (startError) {
      console.error('Error starting speech recognition', startError);
      setError('Could not start speech recognition');
      return false;
    }
  }, [recognition]);

  // Stop Recording Handler
  const stopRecording = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
        isPressingRef.current = false;

        if (pressTimerRef.current) {
          clearTimeout(pressTimerRef.current);
        }
      } catch (stopError) {
        console.error('Error stopping speech recognition', stopError);
        setError('Could not stop speech recognition');
      }
    }
  }, [recognition]);

  // Mobile-specific press and hold logic
  const handleMobileRecordStart = useCallback(async (checkPermission: () => Promise<boolean>) => {
    if (!isMobile) return;

    isPressingRef.current = true;
    await startRecording(checkPermission);

    // Set a timer to check if still pressing
    pressTimerRef.current = setTimeout(() => {
      if (isPressingRef.current && recognition) {
        recognition.start();
      }
    }, 1000);
  }, [startRecording, recognition, isMobile]);

  const handleMobileRecordEnd = useCallback(() => {
    if (!isMobile) return;

    isPressingRef.current = false;
    stopRecording();

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  }, [stopRecording, isMobile]);

  // Desktop/Mobile Recording Handler
  const handleRecordToggle = useCallback(async (checkPermission: () => Promise<boolean>) => {
    if (isMobile) return;  // Handled by press and hold for mobile

    if (isRecording) {
      stopRecording();
    } else {
      await startRecording(checkPermission);
    }
  }, [isRecording, startRecording, stopRecording, isMobile]);

  // Submit Handler
  const handleSubmit = useCallback(() => {
    if (!transcript) {
      alert('Please record your answer first.');
      return;
    }
    onSubmit();
  }, [transcript, onSubmit]);

  return (
    <div className='flex flex-col items-center w-full max-w-[650px]'>
      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm mb-4 w-full text-center">
          {error}
        </div>
      )}

      <MicrophonePermission
        onPermissionGranted={() => console.log('Microphone access granted')}
        onPermissionDenied={() => console.log('Microphone access denied')}
      >
        {(checkPermission) => (
          <div className='flex gap-4 flex-col md:flex-row w-full justify-center'>
            {/* Desktop Recording Button */}
            {!isMobile && (
              <Button
                variant="outline"
                className={`w-full md:w-auto ${isRecording ? 'bg-red-100' : ''}`}
                onClick={() => handleRecordToggle(checkPermission)}
                disabled={!recognition || isLoading || imageLoading}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            )}

            {/* Mobile Recording Buttons */}
            {isMobile && (
              <Button
                variant="outline"
                className={`w-full md:w-auto ${isRecording ? 'bg-red-100' : ''}`}
                onTouchStart={(e) => {
                  e.preventDefault(); // Prevent default touch behavior
                  handleMobileRecordStart(checkPermission);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault(); // Prevent default touch behavior
                  handleMobileRecordEnd();
                }}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent default mouse behavior
                  handleMobileRecordStart(checkPermission);
                }}
                onMouseUp={(e) => {
                  e.preventDefault(); // Prevent default mouse behavior
                  handleMobileRecordEnd();
                }}
                disabled={!recognition || isLoading || imageLoading}
              >
                {isRecording ? 'Recording...' : 'Hold to Record'}
              </Button>
            )}

            {/* Submit Button */}
            <Button
              variant="default"
              className="w-full md:w-auto"
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