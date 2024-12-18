'use client'

import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useEvaluation } from '@/hooks/useEvaluation';
import usePdfData from '@/hooks/usePdfData';
import Pagination from './Pagination';
import MobileDebugger from './MobileDebugger';
import QuestionImageNavigator from './QuestionImageNavigator';
import TranscriptInput from './TranscriptInput';
import RecordingControls from './RecordingControls';
import EvaluationResults from './EvaluationResults';

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
export interface CustomSpeechRecognition {
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

const MAX_QUESTION_NUMBER = 350;

const Question: React.FC = () => {
  // State management
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<CustomSpeechRecognition | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom hooks
  const {
    evaluate,
    isLoading: isEvaluating,
    error: evaluationError,
    data: evaluationData
  } = useEvaluation();

  const {
    fetchImageData,
    images,
    skeletons,
    loading: imageLoading,
    error: imageError
  } = usePdfData();

  // Memoized image loading function
  const loadPdfAndConvertPageToImage = useCallback(async () => {
    try {
      await fetchImageData(questionNumber);
    } catch (error) {
      console.error("Error converting PDF page to image:", error);
    }
  }, [questionNumber]);

  // Image loading effect
  useEffect(() => {
    loadPdfAndConvertPageToImage();
  }, [loadPdfAndConvertPageToImage]);

  // Speech Recognition Setup Effect
  useEffect(() => {
    const setupSpeechRecognition = () => {
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition || !isSpeechRecognitionConstructor(SpeechRecognition)) {
        setError('Speech recognition is not supported on this device');
        return null;
      }

      try {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'nl-NL';

        // Error Handling
        recognitionInstance.onerror = (event: SpeechRecognitionEvent) => {
          console.error('Speech Recognition Error', event);

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
        };

        recognitionInstance.onresult = (event: Event) => {
          const speechEvent = event as unknown as {
            results: ArrayLike<{
              0: { transcript: string }
            }>
          };

          const currentTranscript = Array.from(speechEvent.results)
            .map(result => result[0].transcript)
            .join('');

          setTranscript(currentTranscript);
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

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // Event Handlers
  const handleStartRecording = async (checkPermission: () => Promise<boolean>) => {
    setError(null);

    if (!recognition) {
      setError('Speech recognition is not supported');
      return;
    }

    const hasPermission = await checkPermission();
    if (!hasPermission) {
      setError('Microphone access is required');
      return;
    }

    try {
      recognition.start();
    } catch (startError) {
      console.error('Error starting speech recognition', startError);
      setError('Could not start speech recognition');
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (stopError) {
        console.error('Error stopping speech recognition', stopError);
        setError('Could not stop speech recognition');
      }
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(event.target.value);
  };

  const handleSubmit = async () => {
    if (!transcript) {
      alert('Please record your answer first.');
      return;
    }

    setShowResults(true);
    try {
      await evaluate(questionNumber, transcript);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your answer. Please try again.');
    }
  };

  const handlePrevious = () => {
    if (questionNumber > 1) {
      setQuestionNumber(prev => prev - 1);
      resetQuestionState();
    }
  };

  const handleNext = () => {
    if (questionNumber < MAX_QUESTION_NUMBER) {
      setQuestionNumber(prev => prev + 1);
      resetQuestionState();
    }
  };

  const goToPage = (page: number) => {
    if (page > 0 && page <= MAX_QUESTION_NUMBER) {
      setQuestionNumber(page);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setTranscript('');
    setShowResults(false);
  };

  return (
    <div className='flex flex-col items-center relative'>
      {/* Image Navigator */}
      <QuestionImageNavigator
        questionNumber={questionNumber}
        images={images}
        skeletons={skeletons}
        imageLoading={imageLoading}
        imageError={imageError}
        isLoading={isEvaluating}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
      />

      {/* Pagination */}
      <Pagination
        currentPage={questionNumber}
        totalPages={MAX_QUESTION_NUMBER}
        onPageChange={goToPage}
      />

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-[550px] mb-4 p-3 bg-red-50 border border-red-300 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* Transcript Input */}
      <TranscriptInput
        transcript={transcript}
        handleChange={handleChange}
      />

      {/* Recording Controls */}
      <RecordingControls
        isRecording={isRecording}
        recognition={recognition}
        transcript={transcript}
        isLoading={isEvaluating}
        imageLoading={imageLoading}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        handleSubmit={handleSubmit}
      />

      {/* Evaluation Results */}
      {showResults && (
        <EvaluationResults
          isLoading={isEvaluating}
          evaluationError={evaluationError}
          data={evaluationData}
        />
      )}

      {/* Mobile Debugger for Non-Production */}
      {process.env.NODE_ENV !== 'production' && <MobileDebugger />}
    </div>
  );
};

export default Question;