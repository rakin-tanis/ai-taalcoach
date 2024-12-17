'use client'

import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { useEvaluation } from '@/hooks/useEvaluation';
import Image from 'next/image'
import useImageData from '@/hooks/useImageData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Custom type for Speech Recognition
interface CustomSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Define an interface for the window with potential speech recognition properties
interface ExtendedWindow extends Window {
  SpeechRecognition?: {
    new(): CustomSpeechRecognition;
  };
  webkitSpeechRecognition?: {
    new(): CustomSpeechRecognition;
  };
}

const MAX_QUESTION_NUMBER = 175

const Question: React.FC = () => {
  const [questionNumber, setQuestionNumber] = useState(1)
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<CustomSpeechRecognition | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { evaluate, isLoading, error, data } = useEvaluation();
  const { fetchImageData, image, loading: imageLoading, error: imageError } = useImageData();


  useEffect(() => {
    async function loadPdfAndConvertPageToImage() {
      try {
        await fetchImageData(questionNumber)
      } catch (error) {
        console.error("Error converting PDF page to image:", error);
      }
    }

    loadPdfAndConvertPageToImage()
  }, [questionNumber])


  // Type-safe speech recognition availability check
  const isSpeechRecognitionAvailable = (): boolean => {
    const extendedWindow = window as ExtendedWindow;
    return !!(
      extendedWindow.SpeechRecognition ||
      extendedWindow.webkitSpeechRecognition
    );
  };

  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window !== 'undefined' && isSpeechRecognitionAvailable()) {
      // Type-safe constructor selection
      const extendedWindow = window as ExtendedWindow;
      const SpeechRecognitionConstructor =
        extendedWindow.SpeechRecognition ||
        extendedWindow.webkitSpeechRecognition;

      // Ensure SpeechRecognitionConstructor exists before using
      if (SpeechRecognitionConstructor) {
        // Create recognition instance
        const recognitionInstance = new SpeechRecognitionConstructor() as CustomSpeechRecognition;

        // Rest of your existing configuration...
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'nl-NL';

        // Event handlers
        recognitionInstance.onstart = () => {
          setIsRecording(true);
          setTranscript('');
        };

        recognitionInstance.onresult = (event: Event) => {
          // Type-safe extraction of transcript
          const speechEvent = event as unknown as {
            results: ArrayLike<{
              0: { transcript: string }
            }>
          };

          const results = speechEvent.results;
          const currentTranscript = Array.from(results)
            .map(result => result[0].transcript)
            .join('');

          setTranscript(currentTranscript);
        };

        recognitionInstance.onerror = (event: Event) => {
          console.error('Speech recognition error:', event);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        console.warn('Speech recognition not supported');
      }
    }
    // Cleanup function
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(event.target.value)
  }

  const handleSubmit = async () => {
    if (!transcript) {
      alert('Please record your answer first.');
      return;
    }

    setShowResults(true)
    try {
      const result = await evaluate(questionNumber, transcript)
      console.log(result)

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your answer. Please try again.');
    }
  };

  // Handlers for Previous and Next buttons
  const handlePrevious = () => {
    if (questionNumber > 1) {
      setQuestionNumber(prev => prev - 1);
      setTranscript("")
      setShowResults(false);
    }
  };

  const handleNext = () => {
    // Assuming you have a maximum number of questions, e.g., 5
    if (questionNumber <= MAX_QUESTION_NUMBER) {
      setQuestionNumber(prev => prev + 1);
      setTranscript("")
      setShowResults(false)
    }
  };

  return (
    <div className='flex flex-col items-center relative'>
      <div className='relative w-full max-w-[900px] flex items-center'>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          disabled={questionNumber === 1 || isLoading || imageLoading}
          className='absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
                     md:relative md:mr-4 
                     bg-white/50 dark:bg-black/50 rounded-full shadow-md'
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className='flex-grow relative'>
          {imageLoading
            ? (<div className='animate-pulse w-[800px] h-[616px] bg-gray-300 mb-4'></div>)
            : imageError
              ? (<div>{imageError}</div>)
              : image && (
                <Image
                  src={image}
                  width={100}
                  height={100}
                  alt="Picture of the author"
                  className='w-full h-auto'
                />
              )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={questionNumber === MAX_QUESTION_NUMBER || isLoading || imageLoading}
          className='absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
                     md:relative md:ml-4 
                     bg-white/50 dark:bg-black/50 rounded-full shadow-md'
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <div className='my-4 md:px-14 px-0 max-w-[900px] w-full'>
        <h3 className='text-sm text-gray-400'>Je antwoord:</h3>
        <textarea
          value={transcript}
          onChange={handleChange}
          className='w-full border-none p-2 dark:bg-gray-700'
          rows={3}
        />
      </div>
      <div className='flex gap-4 flex-col md:flex-row w-full justify-center max-w-[900px]'>
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
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
      {showResults &&
        <div className='mt-10 mb-40 md:px-14 max-w-[900px]'>
          {isLoading && <div>Je antwoord wordt geanalyseerd...</div>}
          {error && <div>{error}</div>}
          {data &&
            <div>
              <h2 className={`${data.answer.result === 'voldoende' ? 'text-green-400' : 'text-red-500'} capitalize text-lg font-bold`}>{data.answer.result}</h2>
              {data.answer.feedback}
              <div className='flex flex-col gap-4 mt-4'>
                {data.answer.possibleAnswers.map(pa => (
                  <div key={pa} className='bg-green-900 p-2'>- {pa}</div>
                ))}
              </div>
            </div>
          }
        </div>
      }
    </div>
  );
};

export default Question;